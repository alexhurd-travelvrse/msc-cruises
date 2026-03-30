import React from 'react';

import { Float } from '@react-three/drei';

const GymBall = ({ pos, rotation, size = 0.4, color = "#2e7d32", onClick, ballRef, isCollected }) => {
    return (
        <group position={pos} rotation={rotation} ref={ballRef}>
            {!isCollected && (
                <>
                    {/* Interaction sphere */}
                    <mesh onClick={onClick} onPointerDown={onClick}>
                        <sphereGeometry args={[size * 1.5, 16, 16]} />
                        <meshBasicMaterial transparent opacity={0} depthTest={false} />
                    </mesh>

                    {/* Gym Ball */}
                    <mesh renderOrder={1000}>
                        <sphereGeometry args={[size, 32, 32]} />
                        <meshPhongMaterial
                            color={color}
                            specular="#ffffff"
                            shininess={50}
                            depthTest={false}
                            depthWrite={false}
                        />
                    </mesh>

                    {/* Subtle highlight light */}
                    <pointLight intensity={1} distance={2} color="#ffffff" position={[0, size, 0]} />
                </>
            )}
        </group>
    );
};

export default GymBall;
