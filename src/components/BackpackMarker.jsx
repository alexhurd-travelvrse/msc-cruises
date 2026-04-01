import React, { useRef } from 'react';
import { Billboard, Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

/**
 * Premium Backpack Marker - Minimal Luxury Version
 */
const BackpackMarker = React.forwardRef(({ pos, size = 0.4, onClick, experienceId, isCollected, type }, ref) => {
    const groupRef = useRef();
    
    // Luxury Scene-specific color mapping
    const sceneColors = {
        '1': '#d4af37', // Yacht Club - Gold
        '2': '#00e5ff', // Spa - Teal
        '3': '#ff8c00', // Dining - Social Orange
        '4': '#ff3d00', // Arcade - Racing Red
        '5': '#ffcc00'  // Culture - Culture Yellow
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

    // Standardization: Use a single premium 'Backpack' icon for all items
    const icon = '🎒';

    if (isCollected) return null;

    return (
        <group position={pos} ref={(el) => {
            groupRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
        }}>
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

                    {/* Icon - Minimal Emoji Asset with dynamic tinting */}
                    <Text 
                        position={[0, 0, 0.02]} 
                        fontSize={size * 0.45} 
                        depthTest={false}
                        color={color}
                    >
                        {icon}
                    </Text>
                </Billboard>

                {/* Light source for the marker itself */}
                <pointLight intensity={1.5} color={color} distance={2} decay={2} />
            </Float>
        </group>
    );
});

export default BackpackMarker;
