import React, { useRef } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const BrettAvatar = ({ position, onClick }) => {
    const groupRef = useRef();
    const glowRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Floating animation
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.1;
        }

        // Pulsing glow
        if (glowRef.current) {
            const pulse = (Math.sin(time * 2) + 1) * 0.25 + 0.5; // Range: 0.5 to 1
            glowRef.current.material.emissiveIntensity = pulse;
        }
    });

    return (
        <group
            ref={groupRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
            }}
            onPointerDown={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
            }}
        >
            <Billboard>
                {/* Outer glow ring */}
                <mesh position={[0, 0, -0.01]}>
                    <ringGeometry args={[0.5, 0.65, 32]} />
                    <meshBasicMaterial
                        color="#00e5ff"
                        transparent
                        opacity={0.3}
                    />
                </mesh>

                {/* Main avatar circle */}
                <mesh ref={glowRef}>
                    <circleGeometry args={[0.5, 32]} />
                    <meshStandardMaterial
                        color="#00e5ff"
                        emissive="#00e5ff"
                        emissiveIntensity={0.7}
                    />
                </mesh>

                {/* Avatar text */}
                <Text font="/assets/Inter.ttf"
                    position={[0, 0, 0.01]}
                    fontSize={0.15}
                    color="#050510"
                    fontWeight="bold"
                    anchorX="center"
                    anchorY="middle"
                >
                    BRETT
                </Text>
            </Billboard>

            {/* Speaker Indicator */}
            <Text font="/assets/Inter.ttf"
                position={[0, 0.8, 0]}
                fontSize={0.08}
                color="#FFD700"
                fontWeight="bold"
                anchorX="center"
                anchorY="middle"
            >
                CLICK FOR TIPS
            </Text>
        </group>
    );
};

export default BrettAvatar;
