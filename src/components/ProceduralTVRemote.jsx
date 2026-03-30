import React from 'react';
import * as THREE from 'three';

const ProceduralTVRemote = ({ pos }) => {
    return (
        <group position={pos} scale={0.3}>
            {/* Remote Body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.2, 0.05, 0.6]} />
                <meshStandardMaterial color="#222222" roughness={0.5} metalness={0.2} />
            </mesh>

            {/* Buttons (Decorative) */}
            <mesh position={[0, 0.03, -0.2]}>
                <boxGeometry args={[0.1, 0.02, 0.1]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0, 0.03, 0.1]}>
                <boxGeometry args={[0.08, 0.01, 0.2]} />
                <meshStandardMaterial color="#444444" />
            </mesh>

            {/* Subtle Shadow Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
                <planeGeometry args={[0.4, 0.8]} />
                <meshBasicMaterial color="black" transparent opacity={0.3} />
            </mesh>
        </group>
    );
};

export default ProceduralTVRemote;
