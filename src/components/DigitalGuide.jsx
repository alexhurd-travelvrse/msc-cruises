import React, { useRef, useMemo, useEffect } from 'react';
import { Float, Billboard, useTexture, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useInfluencer } from '../context/InfluencerContext';
import { useVoice } from '../context/VoiceContext';
import * as THREE from 'three';

const DigitalGuide = ({ 
    position = [0, 0, 0], 
    scale = 1, 
    isTransitioning = false, 
    isEntering = false, 
    isFloatingToTarget = false,
    avatarUrl = null,
    isVisible = true 
}) => {
    const group = useRef();
    const meshRef = useRef();
    const glowRingRef = useRef();
    const audioRingRef = useRef();
    
    const { volumeRef, isSpeakingRef } = useVoice();
    
    // ENSURE WE HAVE A VALID AVATAR IMAGE
    const finalAvatarUrl = avatarUrl || '/assets/Alexhurd1.jpg';
    
    const [avatarTex, setAvatarTex] = React.useState(null);
    const [envTex, setEnvTex] = React.useState(null);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        
        console.log(`[DigitalGuide] Loading textures. Avatar: ${finalAvatarUrl}`);
        
        loader.load('/assets/mediterranean_sunset.png', (tex) => {
            tex.mapping = THREE.EquirectangularReflectionMapping;
            setEnvTex(tex);
        });

        loader.load(finalAvatarUrl, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            setAvatarTex(tex);
            console.log(`[DigitalGuide] Avatar texture loaded: ${finalAvatarUrl}`);
        }, undefined, (e) => {
            console.error(`[DigitalGuide] FAILED to load avatar: ${finalAvatarUrl}`, e);
        });

        return () => {
            if (avatarTex) avatarTex.dispose();
            if (envTex) envTex.dispose();
        };
    }, [finalAvatarUrl]);

    // SHARP EDGE FRESNEL FOR RIM GLOW
    const edgeFresnelShader = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#00e5ff') },
            uPower: { value: 3.5 },
            uAudioPulse: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            uniform float uPower;
            uniform float uAudioPulse;
            uniform float uTime;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec2 vUv;
            
            void main() {
                vec3 viewDirection = normalize(vViewPosition);
                float fresnel = pow(1.0 - clamp(dot(viewDirection, vNormal), 0.0, 1.0), uPower);
                float scanline = sin(vUv.y * 100.0 + uTime * 5.0) * 0.1;
                vec3 glow = uColor * (fresnel * 1.8 + uAudioPulse * fresnel * 2.5 + scanline * fresnel);
                gl_FragColor = vec4(glow, fresnel * 0.8);
            }
        `
    }), []);

    useFrame((state) => {
        if (!group.current) return;
        const time = state.clock.elapsedTime;
        const v = volumeRef?.current || 0;
        const audioPulse = v * 2.5; 

        if (meshRef.current) {
            meshRef.current.material.uniforms.uAudioPulse.value = audioPulse;
            meshRef.current.material.uniforms.uTime.value = time;
        }

        if (isTransitioning) {
            group.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.08);
            group.current.position.y += 0.02;
        } else {
            const targetScale = isVisible ? 1.0 : 0;
            const currentScale = group.current.scale.x;
            const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.15);
            group.current.scale.set(newScale, newScale, newScale);

            if (isFloatingToTarget && isVisible) {
                const targetPosVec = new THREE.Vector3(position[0], position[1], position[2]);
                group.current.position.lerp(targetPosVec, 0.1);
            }

            if (audioRingRef.current) {
                audioRingRef.current.rotation.z = -time * 0.8;
                audioRingRef.current.scale.setScalar(1.15 + audioPulse * 0.25);
            }
        }
    });

    return (
        <group ref={group} position={position} scale={scale} renderOrder={10000}>
            {/* 1. PHYSICAL GLASS SHELL */}
            <mesh renderOrder={10001}>
                <sphereGeometry args={[0.5, 64, 64]} />
                <meshPhysicalMaterial 
                    color="#e0f7fa"
                    transparent={true}
                    opacity={0.4}
                    roughness={0.05}
                    metalness={0.1}
                    transmission={0.9}
                    thickness={0.5}
                    ior={1.5}
                    envMap={envTex}
                    envMapIntensity={2.5}
                    clearcoat={1.0}
                    depthWrite={false}
                    depthTest={false}
                />
            </mesh>

            <mesh ref={meshRef} renderOrder={10002}>
                <sphereGeometry args={[0.505, 64, 64]} />
                <shaderMaterial 
                    {...edgeFresnelShader}
                    transparent={true}
                    depthWrite={false}
                    depthTest={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {!isTransitioning && (
                <Billboard position={[0, 0, 0]} renderOrder={10010}>
                    <mesh position={[0, 0, 0.01]}>
                        <circleGeometry args={[0.35, 64]} />
                        <meshBasicMaterial 
                            map={avatarTex} 
                            transparent={true} 
                            opacity={avatarTex ? 1.0 : 0.0}
                            blending={THREE.NormalBlending}
                            depthWrite={false}
                            depthTest={false}
                        />
                    </mesh>
                    
                    <mesh ref={audioRingRef} position={[0, 0, 0]}>
                        <ringGeometry args={[0.38, 0.41, 64]} />
                        <meshBasicMaterial 
                            color="#00e5ff" 
                            transparent 
                            opacity={0.6} 
                            depthWrite={false}
                            depthTest={false}
                        />
                    </mesh>

                    <mesh position={[0, 0, -0.01]}>
                        <circleGeometry args={[0.37, 64]} />
                        <meshBasicMaterial 
                            color="#00e5ff" 
                            transparent 
                            opacity={0.1} 
                            depthWrite={false}
                            depthTest={false}
                        />
                    </mesh>
                </Billboard>
            )}
        </group>
    );
};

export default DigitalGuide;
