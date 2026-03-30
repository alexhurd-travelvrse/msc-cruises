import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations, Float } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const AdvancedAvatar = ({ position = [0, 0, 0], scale = 1 }) => {
    const group = useRef();
    const { scene } = useGLTF('/models/racingcar.glb');
    const { mouse } = useThree();

    useEffect(() => {
        console.log("AdvancedAvatar: RacingCar Load Attempt");
    }, []);

    useFrame((state) => {
        if (!group.current) return;
        const time = state.clock.getElapsedTime();
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (mouse.x * Math.PI) / 8, 0.1);
    });

    if (!scene) return null;

    return (
        <group ref={group} position={position} scale={scale} dispose={null}>
            <primitive object={scene} />
        </group>
    );
};

useGLTF.preload('/models/racingcar.glb');

export default AdvancedAvatar;
