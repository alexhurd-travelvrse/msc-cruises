import React, { useMemo } from 'react';
import * as THREE from 'three';

const ProceduralWineGlass = ({ pos }) => {
    // 1. Create the Glass Shape (Lathe)
    const glassPoints = useMemo(() => {
        const pts = [];
        // Base
        pts.push(new THREE.Vector2(0, 0));
        pts.push(new THREE.Vector2(0.06, 0));
        pts.push(new THREE.Vector2(0.06, 0.005));
        // Stem
        pts.push(new THREE.Vector2(0.01, 0.005));
        pts.push(new THREE.Vector2(0.01, 0.08));
        // Bowl
        pts.push(new THREE.Vector2(0.01, 0.08));
        pts.push(new THREE.Vector2(0.05, 0.1));
        pts.push(new THREE.Vector2(0.07, 0.15));
        pts.push(new THREE.Vector2(0.065, 0.22));
        pts.push(new THREE.Vector2(0.05, 0.24));
        return pts;
    }, []);

    // 2. Create the Wine Shape (Internal Lathe)
    const winePoints = useMemo(() => {
        const pts = [];
        pts.push(new THREE.Vector2(0, 0.085));
        pts.push(new THREE.Vector2(0.045, 0.1));
        pts.push(new THREE.Vector2(0.06, 0.15));
        pts.push(new THREE.Vector2(0.06, 0.16)); // Surface height
        pts.push(new THREE.Vector2(0, 0.16));
        return pts;
    }, []);

    return (
        <group position={pos} scale={0.48}>
            {/* The Glass */}
            <mesh castShadow receiveShadow>
                <latheGeometry args={[glassPoints, 32]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    metalness={0.1}
                    roughness={0}
                    transmission={1} // Transparency with refraction
                    thickness={0.02}
                    envMapIntensity={1}
                    transparent
                />
            </mesh>

            {/* The Wine */}
            <mesh position={[0, 0.001, 0]}>
                <latheGeometry args={[winePoints, 32]} />
                <meshStandardMaterial
                    color="#722F37" // Wine Red
                    roughness={0.1}
                    metalness={0.2}
                />
            </mesh>

            {/* Subtle Shadow Plane for grounding */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[0.2, 0.2]} />
                <meshBasicMaterial color="black" transparent opacity={0.3} />
            </mesh>
        </group>
    );
};

export default ProceduralWineGlass;
