import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { OrbitControls } from '@react-three/drei';

const SPEED = 3.0;

const AvatarController = ({ startPos = [0, 0, 0], boundaries = [] }) => {
    const targetRef = useRef(new Vector3(...startPos));
    const controlsRef = useRef();
    const { camera } = useThree();

    // Input state
    const input = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
    });

    useEffect(() => {
        // Initial Camera Setup - match target exactly at start
        camera.position.set(startPos[0], startPos[1] + 1.2, startPos[2] + 2);

        if (controlsRef.current) {
            controlsRef.current.target.copy(targetRef.current);
            controlsRef.current.update();
        }

        const handleKeyDown = (e) => {
            const code = e.code;
            if (code === 'KeyW' || code === 'ArrowUp') input.current.forward = true;
            if (code === 'KeyS' || code === 'ArrowDown') input.current.backward = true;
            if (code === 'KeyA' || code === 'ArrowLeft') input.current.left = true;
            if (code === 'KeyD' || code === 'ArrowRight') input.current.right = true;
        };

        const handleKeyUp = (e) => {
            const code = e.code;
            if (code === 'KeyW' || code === 'ArrowUp') input.current.forward = false;
            if (code === 'KeyS' || code === 'ArrowDown') input.current.backward = false;
            if (code === 'KeyA' || code === 'ArrowLeft') input.current.left = false;
            if (code === 'KeyD' || code === 'ArrowRight') input.current.right = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [startPos, camera]);

    useFrame((state, delta) => {
        const { forward, backward, left, right } = input.current;

        if (forward || backward || left || right) {
            const camForward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            camForward.y = 0;
            if (camForward.lengthSq() > 0.0001) {
                camForward.normalize();
            } else {
                camForward.set(0, 0, 0);
            }

            const camRight = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            camRight.y = 0;
            if (camRight.lengthSq() > 0.0001) {
                camRight.normalize();
            } else {
                camRight.set(0, 0, 0);
            }

            const moveDir = new Vector3(0, 0, 0);
            if (forward) moveDir.add(camForward);
            if (backward) moveDir.sub(camForward);
            if (left) moveDir.sub(camRight);
            if (right) moveDir.add(camRight);

            if (moveDir.lengthSq() > 0) {
                moveDir.normalize();
                const moveStep = moveDir.clone().multiplyScalar(SPEED * delta);
                const nextPos = targetRef.current.clone().add(moveStep);

                // Collision Detection
                let collided = false;
                const radius = 0.5; // Bubble around the focal point

                for (const b of boundaries) {
                    const minX = b.position[0] - b.size[0] / 2 - radius;
                    const maxX = b.position[0] + b.size[0] / 2 + radius;
                    const minZ = b.position[2] - b.size[2] / 2 - radius;
                    const maxZ = b.position[2] + b.size[2] / 2 + radius;

                    if (nextPos.x > minX && nextPos.x < maxX &&
                        nextPos.z > minZ && nextPos.z < maxZ) {
                        collided = true;
                        break;
                    }
                }

                if (!collided) {
                    targetRef.current.copy(nextPos);
                }
            }
        }

        if (controlsRef.current) {
            // Smoothly move the camera target to where the player is "walking"
            controlsRef.current.target.lerp(targetRef.current, 0.2);
            controlsRef.current.update();
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableKeys={false}
            makeDefault
            minDistance={0.5}
            maxDistance={4}
            maxPolarAngle={Math.PI / 1.7}
        />
    );
};

export default AvatarController;
