import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const WarpStars = ({ speedMultiplier = 1 }) => {
    const ref = useRef();
    const count = 3000;

    const [positions, colors] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const tropicalColors = [
            new THREE.Color('#5BC0DE'), // Aqua
            new THREE.Color('#FFD700'), // Mango
            new THREE.Color('#FFFFFF'), // White
            new THREE.Color('#00e5ff')  // Glow Blue
        ];

        for (let i = 0; i < count; i++) {
            const z = (Math.random() - 0.5) * 180;
            const theta = Math.random() * Math.PI * 2;
            
            // FUNNEL LOGIC: Radius is much tighter at the center (camera) and wider at the back
            // We use a parabolic curve for the funnel walls
            const zNorm = (z + 90) / 180; // 0 to 1
            const r = 0.2 + (Math.pow(1.0 - zNorm, 2.0) * 15.0) + (Math.random() * 2.0);
            
            pos[i * 3] = r * Math.cos(theta); 
            pos[i * 3 + 1] = r * Math.sin(theta); 
            pos[i * 3 + 2] = z; 

            const color = tropicalColors[Math.floor(Math.random() * tropicalColors.length)];
            col[i * 3] = color.r;
            col[i * 3 + 1] = color.g;
            col[i * 3 + 2] = color.b;
        }
        return [pos, col];
    }, []);

    useFrame((state, delta) => {
        const speed = 60 * speedMultiplier; 
        const attr = ref.current.geometry.attributes.position;
        const arr = attr.array;

        for (let i = 0; i < count; i++) {
            arr[i * 3 + 2] += delta * speed;
            
            // If star passes camera, reset to far back
            if (arr[i * 3 + 2] > 10) {
                arr[i * 3 + 2] = -90;
                // Re-randomize angle for variety
                const theta = Math.random() * Math.PI * 2;
                const r = 0.2 + (Math.pow(1.0 - 0.0, 2.0) * 15.0) + (Math.random() * 2.0);
                arr[i * 3] = r * Math.cos(theta);
                arr[i * 3 + 1] = r * Math.sin(theta);
            }
        }
        attr.needsUpdate = true;
        ref.current.rotation.z += delta * 0.25; // Faster funnel spin
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                    usage={THREE.DynamicDrawUsage}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                transparent
                vertexColors
                size={0.09}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

const TeleportBackground = ({ voyageTitle = "MSC WORLD EUROPA" }) => {
    const [phase, setPhase] = useState('warp'); // 'warp' -> 'transition' -> 'arrived'

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('transition'), 8500);
        const t2 = setTimeout(() => setPhase('arrived'), 10000); 
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, overflow: 'hidden', background: '#020008' }}>

            {/* PHASE 1: 3D Warp Tunnel */}
            <div style={{
                position: 'absolute', inset: 0,
                opacity: phase === 'arrived' ? 0 : 1,
                transition: 'opacity 1.5s ease-out'
            }}>
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 70 }}
                    dpr={1}
                    gl={{ antialias: false, stencil: false, depth: false, powerPreference: 'low-power' }}
                >
                    <color attach="background" args={['#020008']} />
                    <fog attach="fog" args={['#020008', 20, 100]} />
                    <WarpStars speedMultiplier={phase === 'transition' ? 2.5 : 1} /> 
                </Canvas>

                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at center, transparent 20%, rgba(2,0,8,0.9) 100%)',
                    pointerEvents: 'none',
                }} />
            </div>

            {/* PHASE 2: Ship Arriving */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'url(/assets/msc_ship.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                opacity: phase === 'warp' ? 0 : 1,
                transition: 'opacity 2s ease-in',
                animation: phase !== 'warp' ? 'trueZoomIn 12s ease-out forwards' : 'none',
                transformOrigin: 'center center',
            }} />

            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(2,0,8,0.6) 0%, rgba(0,15,30,0.3) 50%, rgba(2,0,8,0.8) 100%)',
                opacity: phase === 'warp' ? 0 : 1,
                transition: 'opacity 2.5s ease-in',
            }} />

            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.02) 3px, rgba(0,229,255,0.02) 4px)',
                pointerEvents: 'none',
            }} />

            {/* Teleporting wording */}
            <div style={{
                position: 'absolute', bottom: '15%', left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                textAlign: 'center',
            }}>
                <div style={{
                    fontSize: '0.8rem',
                    letterSpacing: '10px',
                    color: 'var(--color-accent-primary)',
                    textTransform: 'uppercase',
                    animation: 'shimmer 1.5s ease-in-out infinite',
                    whiteSpace: 'nowrap',
                    textShadow: '0 0 15px rgba(0,229,255,0.6)',
                    fontWeight: '800'
                }}>
                    {phase === 'warp' ? '▶ Initiating Warp...' : `▶ Approaching ${voyageTitle}`}
                </div>
            </div>
        </div>
    );
};

export default TeleportBackground;
