import React, { Suspense } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';

const AvatarModel = ({ url, position, rotation, scale }) => {
    // Load the model
    const { scene } = useGLTF(url);

    // Safety: Ensure all materials are non-transparent if not needed to avoid overdraw
    scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
        }
    });

    return (
        <primitive
            object={scene}
            position={position}
            rotation={rotation}
            scale={scale}
        />
    );
};

const HIFIStaticAvatar = ({ pos = [1, 0, 1], rotation = [0, 0, 0] }) => {
    // We use the compressed model
    const modelUrl = '/models/Ch31_nonPBR-compressed.glb';

    return (
        <group position={pos} rotation={rotation}>
            <Suspense fallback={<mesh position={[0, 0.9, 0]}><boxGeometry args={[0.5, 1.8, 0.5]} /><meshStandardMaterial color="gray" transparent opacity={0.5} /></mesh>}>
                <AvatarModel
                    url={modelUrl}
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]} // Removed hardcoded PI + PI/4 offset
                    scale={0.0093} // Increased 3x (was 0.0031)
                />
            </Suspense>
        </group>
    );
};

// Preload for better performance
useGLTF.preload('/models/Ch31_nonPBR-compressed.glb');

export default HIFIStaticAvatar;
