import React from 'react';
import { Billboard, Text } from '@react-three/drei';

const InteractiveMenu = ({ pos, onClick }) => {
    return (
        <group position={pos}>
            <Billboard follow={true} lockX={false} lockY={true} lockZ={false}>
                {/* Visual representation: Burgundy Booklet with Gold Trim */}
                <mesh onClick={onClick} onPointerDown={onClick}>
                    <planeGeometry args={[0.32, 0.48]} />
                    <meshBasicMaterial color="#FFD700" depthTest={false} depthWrite={false} /> {/* Gold Border */}
                </mesh>
                <mesh position={[0, 0, 0.01]} onClick={onClick} onPointerDown={onClick}>
                    <planeGeometry args={[0.28, 0.44]} />
                    <meshBasicMaterial color="#8b0000" depthTest={false} depthWrite={false} /> {/* Burgundy Body */}
                </mesh>
                <mesh position={[0, 0, 0.02]} onClick={onClick} onPointerDown={onClick}>
                    <planeGeometry args={[0.02, 0.44]} />
                    <meshBasicMaterial color="#FFD700" depthTest={false} depthWrite={false} /> {/* Spine Detail */}
                </mesh>
            </Billboard>
        </group>
    );
};

export default InteractiveMenu;
