import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const GoldenBell = ({ pos, rotation, size, onClick, bellRef, isCollected }) => {
    const { scene } = useGLTF('/models/GoldenBell.glb');
    const model = React.useMemo(() => scene.clone(), [scene]);

    React.useEffect(() => {
        if (!model) return;

        model.traverse((child) => {
            if (child.isMesh) {
                child.geometry.computeVertexNormals();
                child.castShadow = false;
                child.receiveShadow = false;

                child.material = new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color("#FFD700"),
                    metalness: 1.0,
                    roughness: 0.1,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.05,
                    emissive: new THREE.Color("#110a00"),
                    side: THREE.DoubleSide,
                    reflectivity: 1.0,
                    envMapIntensity: 1.5,
                    // Disable any shadow-like effects
                    aoMapIntensity: 0,
                    flatShading: false
                });
            }
        });
    }, [model]);

    const handleClick = (e) => {
        e.stopPropagation();
        onClick(e);
    };

    const adjustedScale = size * 0.7;

    return (
        <group position={pos} rotation={rotation} ref={bellRef}>
            {!isCollected && (
                <mesh onClick={handleClick} onPointerDown={handleClick}>
                    <sphereGeometry args={[size * 1.5, 8, 8]} />
                    <meshBasicMaterial transparent opacity={0} depthTest={false} />
                </mesh>
            )}

            {/* Locked to pinpointed horizontal position */}
            <group scale={[adjustedScale, adjustedScale, adjustedScale]}>
                <primitive object={model} />
            </group>
        </group>
    );
};

useGLTF.preload('/models/GoldenBell.glb');

export default GoldenBell;
