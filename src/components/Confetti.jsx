import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Confetti = ({ count = 150 }) => {
    const meshRef = useRef();
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 2, // Wider spread
                0, // Start at local origin (height handled by parent)
                (Math.random() - 0.5) * 2
            );
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() * 0.3) + 0.2, // Explosive jump
                (Math.random() - 0.5) * 0.2
            );
            const rotation = new THREE.Euler(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
            temp.push({ position, velocity, rotation, color, scale: (Math.random() * 0.15) + 0.1 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        particles.forEach((p, i) => {
            // Apply Gravity
            p.velocity.y -= 0.005;

            // Move
            p.position.add(p.velocity);

            // Rotate
            p.rotation.x += 0.1;
            p.rotation.z += 0.05;

            // Bounce/Stop if hit floor (y=0)
            if (p.position.y < 0) {
                p.position.y = 0;
                p.velocity.set(0, 0, 0);
            }

            dummy.position.copy(p.position);
            dummy.rotation.copy(p.rotation);
            dummy.scale.set(p.scale, p.scale, p.scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
            meshRef.current.setColorAt(i, p.color);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, count]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial side={THREE.DoubleSide} vertexColors />
        </instancedMesh>
    );
};

export default Confetti;
