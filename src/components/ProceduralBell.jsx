import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ProceduralBell = ({ pos, rotation, size, onClick, bellRef, isCollected }) => {
    const groupRef = useRef();

    // Very subtle hover effect (realistic)
    useFrame((state) => {
        if (groupRef.current && !isCollected) {
            groupRef.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        onClick(e);
    };

    const adjustedSize = size * 1.05;

    return (
        <group position={pos} rotation={rotation} ref={(el) => { if (bellRef) bellRef.current = el; groupRef.current = el; }}>
            {/* Invisible click target */}
            {!isCollected && (
                <mesh onClick={handleClick} onPointerDown={handleClick}>
                    <sphereGeometry args={[size * 1.5, 8, 8]} />
                    <meshBasicMaterial transparent opacity={0} depthTest={false} />
                </mesh>
            )}

            {/* Base plate - Chrome/Brass */}
            <mesh position={[0, -adjustedSize * 0.7, 0]} castShadow={false} receiveShadow={false}>
                <cylinderGeometry args={[adjustedSize * 1.3, adjustedSize * 1.3, adjustedSize * 0.15, 32]} />
                <meshStandardMaterial
                    color="#C0C0C0"
                    metalness={1.0}
                    roughness={0.15}
                />
            </mesh>

            {/* Bell dome - Realistic hotel bell shape (flatter, wider) */}
            <mesh position={[0, 0, 0]} castShadow={false} receiveShadow={false}>
                <sphereGeometry args={[adjustedSize * 1.1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                <meshStandardMaterial
                    color="#D4AF37"
                    metalness={1.0}
                    roughness={0.12}
                    envMapIntensity={2.0}
                />
            </mesh>

            {/* Bell rim reinforcement */}
            <mesh position={[0, -adjustedSize * 0.35, 0]} castShadow={false} receiveShadow={false}>
                <torusGeometry args={[adjustedSize * 1.08, adjustedSize * 0.04, 16, 32]} />
                <meshStandardMaterial
                    color="#B8860B"
                    metalness={1.0}
                    roughness={0.15}
                />
            </mesh>

            {/* Top button/knob - Chrome */}
            <mesh position={[0, adjustedSize * 0.65, 0]} castShadow={false} receiveShadow={false}>
                <cylinderGeometry args={[adjustedSize * 0.25, adjustedSize * 0.28, adjustedSize * 0.2, 24]} />
                <meshStandardMaterial
                    color="#E5E5E5"
                    metalness={1.0}
                    roughness={0.1}
                />
            </mesh>

            {/* Top button cap */}
            <mesh position={[0, adjustedSize * 0.75, 0]} castShadow={false} receiveShadow={false}>
                <sphereGeometry args={[adjustedSize * 0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <meshStandardMaterial
                    color="#E5E5E5"
                    metalness={1.0}
                    roughness={0.1}
                />
            </mesh>

            {/* Subtle glow when not collected */}
            {!isCollected && (
                <pointLight
                    position={[0, 0, 0]}
                    intensity={1.2}
                    distance={2.5}
                    color="#FFE4B5"
                    castShadow={false}
                />
            )}
        </group>
    );
};

export default ProceduralBell;
