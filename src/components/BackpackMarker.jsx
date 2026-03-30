import React, { useRef, Suspense } from 'react';
import { Billboard, Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Premium Backpack Marker for the 3D Experience
 * Features:
 * - Animated floating effect
 * - Color-coded by scene
 * - Subtle glowing ring
 * - Better typography and layout
 */
const BackpackMarker = ({ pos, size = 0.4, onClick, experienceId, isCollected }) => {
    const groupRef = useRef();
    
    // Scene-specific color mapping (Matches MSC Theme)
    const sceneColors = {
        '1': '#00e5ff', // Yacht Club - Cyan
        '2': '#ff2d55', // Spa - Rosy Red
        '3': '#ff9500', // Dining - Orange
        '4': '#af52de', // Arcade - Purple
        '5': '#ffd700'  // Culture - Gold
    };
    
    const color = sceneColors[experienceId] || '#ffffff';

    // Pulse animation for the glow ring
    useFrame(({ clock }) => {
        if (groupRef.current) {
            const time = clock.getElapsedTime();
            const ring = groupRef.current.getObjectByName('glowRing');
            if (ring) {
                ring.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
                ring.material.opacity = 0.4 + Math.sin(time * 3) * 0.2;
            }
        }
    });

    if (isCollected) return null;

    return (
        <group position={pos} ref={groupRef}>
            <Float
                speed={2} 
                rotationIntensity={0.5} 
                floatIntensity={0.5}
                floatingRange={[-0.05, 0.05]}
            >
                <Billboard
                    follow={true}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick(e);
                    }}
                >
                    {/* Glow Ring */}
                    <mesh name="glowRing" position={[0, 0, -0.01]}>
                        <ringGeometry args={[size * 0.45, size * 0.52, 64]} />
                        <meshBasicMaterial color={color} transparent opacity={0.6} depthTest={false} />
                    </mesh>
                    
                    {/* Background Disc - Premium Glass Effect */}
                    <mesh>
                        <circleGeometry args={[size * 0.42, 64]} />
                        <meshBasicMaterial color="#0b1e3b" transparent opacity={0.8} depthTest={false} />
                    </mesh>

                    {/* Outer Border */}
                    <mesh position={[0, 0, 0.001]}>
                        <ringGeometry args={[size * 0.4, size * 0.42, 64]} />
                        <meshBasicMaterial color={color} transparent opacity={1} depthTest={false} />
                    </mesh>

                    {/* Icon - Premium Emoji Asset */}
                    <Text position={[0, 0, 0.02]} fontSize={size * 0.45} depthTest={false}>
                        🎒
                    </Text>

                    {/* LABEL - Action Call */}
                    <group position={[0, -size * 0.65, 0]}>
                         {/* Label Background */}
                        <mesh position={[0, 0, -0.01]}>
                            <planeGeometry args={[size * 1.8, size * 0.35]} />
                            <meshBasicMaterial color="black" transparent opacity={0.5} />
                        </mesh>
                        <Text font="/assets/Inter.ttf"
                            fontSize={size * 0.12}
                            color="white"
                            maxWidth={size * 2}
                            textAlign="center"
                            fontWeight="bold"
                            depthTest={false}
                        >
                            ADD TO BACKPACK
                        </Text>
                    </group>
                </Billboard>

                {/* Light source for the marker itself */}
                <pointLight intensity={1.5} color={color} distance={2} decay={2} />
            </Float>
        </group>
    );
};

export default BackpackMarker;
