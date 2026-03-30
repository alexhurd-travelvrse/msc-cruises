import React, { useMemo } from 'react';
import * as THREE from 'three';

const ProceduralGelato = ({ pos }) => {
    // 1. Create the Cone Shape (Lathe)
    const conePoints = useMemo(() => {
        const pts = [];
        pts.push(new THREE.Vector2(0, 0));
        pts.push(new THREE.Vector2(0.01, 0));
        pts.push(new THREE.Vector2(0.045, 0.15));
        pts.push(new THREE.Vector2(0.05, 0.16));
        return pts;
    }, []);

    return (
        <group position={pos} scale={0.6}>
            {/* The Cone */}
            <mesh castShadow position={[0, -0.05, 0]}>
                <latheGeometry args={[conePoints, 16]} />
                <meshStandardMaterial
                    color="#D2B48C" // Tan/Waffle color
                    roughness={0.8}
                    metalness={0}
                />
            </mesh>

            {/* Scoops */}
            <mesh position={[0, 0.12, 0]} castShadow>
                <sphereGeometry args={[0.045, 16, 16]} />
                <meshStandardMaterial color="#90EE90" roughness={0.6} /> {/* Pistachio */}
            </mesh>
            <mesh position={[0.03, 0.16, 0.02]} castShadow>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial color="#FFB6C1" roughness={0.6} /> {/* Strawberry */}
            </mesh>
            <mesh position={[-0.02, 0.18, -0.01]} castShadow>
                <sphereGeometry args={[0.042, 16, 16]} />
                <meshStandardMaterial color="#FFFACD" roughness={0.6} /> {/* Vanilla */}
            </mesh>

            {/* Subtle Shadow Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
                <planeGeometry args={[0.15, 0.15]} />
                <meshBasicMaterial color="black" transparent opacity={0.3} />
            </mesh>
        </group>
    );
};

export default ProceduralGelato;
