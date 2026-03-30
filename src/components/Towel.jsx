import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const Towel = ({ pos, size, onClick, towelRef, isCollected }) => {
    // Generate Realistic Fabric Texture
    const fabricTexture = React.useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base color
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(0, 0, 512, 512);

        // Fabric grain / woven pattern
        ctx.strokeStyle = '#22ffff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 512; i += 4) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }

        // Folds / highlights
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 512;
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(x, 0, 20, 512);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        return tex;
    }, []);

    const mainRef = useRef();

    useFrame((state) => {
        if (mainRef.current) {
            const time = state.clock.getElapsedTime();
            mainRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;
            mainRef.current.position.y = Math.sin(time * 1.5) * 0.01;
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        onClick(e);
    };

    return (
        <group position={pos} ref={towelRef}>
            {!isCollected && (
                <>
                    <mesh onClick={handleClick} onPointerDown={handleClick}>
                        <sphereGeometry args={[size * 3.5, 8, 8]} />
                        <meshBasicMaterial transparent opacity={0} depthTest={false} />
                    </mesh>

                    <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.2}>
                        <group ref={mainRef} scale={[size, size, size]} rotation={[0.1, Math.PI / 4, 0.05]}>
                            {/* Realistic Rolled Towel Shape */}
                            <mesh rotation={[0, 0, Math.PI / 2]} renderOrder={1000}>
                                <cylinderGeometry args={[0.5, 0.5, 2.0, 32, 8, false]} />
                                <meshPhysicalMaterial
                                    map={fabricTexture}
                                    roughness={0.9}
                                    metalness={0}
                                    sheen={1.0}
                                    sheenRoughness={0.1}
                                    sheenColor="#ffffff"
                                    transparent
                                    opacity={1}
                                    depthTest={false}
                                    depthWrite={false}
                                />
                            </mesh>

                            {/* Inner spiral to look like it's rolled */}
                            <mesh position={[1.01, 0, 0]} rotation={[0, 0, Math.PI / 2]} renderOrder={1000}>
                                <circleGeometry args={[0.48, 32]} />
                                <meshBasicMaterial color="#00b8cc" depthTest={false} depthWrite={false} />
                            </mesh>
                            <mesh position={[-1.01, 0, 0]} rotation={[0, 0, -Math.PI / 2]} renderOrder={1000}>
                                <circleGeometry args={[0.48, 32]} />
                                <meshBasicMaterial color="#00b8cc" depthTest={false} depthWrite={false} />
                            </mesh>
                        </group>

                    </Float>

                    <pointLight position={[0, 0.5, 0.2]} color="#00e5ff" intensity={3} distance={4} />
                </>
            )}
        </group>
    );
};

export default Towel;
