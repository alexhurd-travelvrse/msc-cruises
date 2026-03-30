import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler } from 'three';

const MAX_SPEED = 10.0;
const ACCELERATION = 25.0;
const FRICTION = 10.0;
const LOOK_SPEED = 0.002;

export const usePlayerControls = (startPos, startRot = [0, 0, 0], boundaries = [], enabled = true) => {
    const { camera } = useThree();

    // Movement state
    const moveState = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false,
        targetPos: null
    });

    // Velocity for inertia
    const velocity = useRef(new Vector3(0, 0, 0));
    const rotationVelocity = useRef({ x: 0, y: 0 });

    const isDragging = useRef(false);
    const previousMouse = useRef({ x: 0, y: 0 });
    const enabledRef = useRef(enabled);

    // Sync ref with prop
    useEffect(() => {
        enabledRef.current = enabled;
        // console.log(`%c[PlayerControls] Interactivity: ${enabled ? 'ENABLED' : 'LOCKED'}`, `color: ${enabled ? '#00ff00' : '#ff0000'}; font-weight: bold;`);
    }, [enabled]);

    const lastAppliedPos = useRef(null);

    useEffect(() => {
        console.log(`[usePlayerControls] Setup for experience. startPos:`, startPos);
        
        // Apply the new position when transitioning rooms
        camera.position.set(...startPos);
        camera.rotation.set(...startRot);

        const logCamera = () => {
            const pos = [camera.position.x.toFixed(3), camera.position.y.toFixed(3), camera.position.z.toFixed(3)];
            const rot = [camera.rotation.x.toFixed(3), camera.rotation.y.toFixed(3), camera.rotation.z.toFixed(3)];
            const output = `startPos: [${pos.join(', ')}], startRot: [${rot.join(', ')}]`;

            console.log('%c[CAMERA CONFIG]', 'color: #00ff00; font-weight: bold; font-size: 14px;', output);
            alert("Camera Position Captured! Check your console (F12) to copy it.");
        };

        const handleKeyDown = (e) => {
            if (!enabledRef.current) return;
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': moveState.current.forward = true; break;
                case 'KeyS': case 'ArrowDown': moveState.current.backward = true; break;
                case 'KeyA': case 'ArrowLeft': moveState.current.left = true; break;
                case 'KeyD': case 'ArrowRight': moveState.current.right = true; break;
                case 'KeyQ': moveState.current.up = true; break;
                case 'KeyE': moveState.current.down = true; break;
                case 'KeyP': logCamera(); break;
            }
        };

        const handleKeyUp = (e) => {
            if (!enabledRef.current) return;
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': moveState.current.forward = false; break;
                case 'KeyS': case 'ArrowDown': moveState.current.backward = false; break;
                case 'KeyA': case 'ArrowLeft': moveState.current.left = false; break;
                case 'KeyD': case 'ArrowRight': moveState.current.right = false; break;
                case 'KeyQ': moveState.current.up = false; break;
                case 'KeyE': moveState.current.down = false; break;
            }
        };

        const handleMouseDown = (e) => {
            if (!enabledRef.current || e.target.tagName !== 'CANVAS') return; // Only drag on canvas
            isDragging.current = true;
            previousMouse.current = { x: e.clientX, y: e.clientY };
            rotationVelocity.current = { x: 0, y: 0 }; // Reset velocity on click
        };

        const handleMouseUp = () => {
            isDragging.current = false;
        };

        const handleMouseMove = (e) => {
            if (!enabledRef.current || !isDragging.current) return;

            const deltaX = e.clientX - previousMouse.current.x;
            const deltaY = e.clientY - previousMouse.current.y;

            previousMouse.current = { x: e.clientX, y: e.clientY };

            // Set rotation velocity based on mouse delta
            rotationVelocity.current.y = -deltaX * LOOK_SPEED * 6.0;
            rotationVelocity.current.x = -deltaY * LOOK_SPEED * 6.0;

            const euler = new Euler(0, 0, 0, 'YXZ').setFromQuaternion(camera.quaternion);
            euler.y -= deltaX * LOOK_SPEED;
            euler.x -= deltaY * LOOK_SPEED;
            euler.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.x));
            camera.quaternion.setFromEuler(euler);
        };

        const handleTouchStart = (e) => {
            if (!enabledRef.current || e.target.tagName !== 'CANVAS') return;
            isDragging.current = true;
            const touch = e.touches[0];
            previousMouse.current = { x: touch.clientX, y: touch.clientY };
            rotationVelocity.current = { x: 0, y: 0 };
        };

        const handleTouchMove = (e) => {
            if (!enabledRef.current || !isDragging.current) return;
            const touch = e.touches[0];
            const deltaX = touch.clientX - previousMouse.current.x;
            const deltaY = touch.clientY - previousMouse.current.y;

            previousMouse.current = { x: touch.clientX, y: touch.clientY };

            rotationVelocity.current.y = -deltaX * LOOK_SPEED * 6.0;
            rotationVelocity.current.x = -deltaY * LOOK_SPEED * 6.0;

            const euler = new Euler(0, 0, 0, 'YXZ').setFromQuaternion(camera.quaternion);
            euler.y -= deltaX * LOOK_SPEED;
            euler.x -= deltaY * LOOK_SPEED;
            euler.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.x));
            camera.quaternion.setFromEuler(euler);
        };

        const handleTouchEnd = () => {
            isDragging.current = false;
        };

        const handleMoveTo = (e) => {
            if (!enabledRef.current) return;
            const { pos } = e.detail;
            moveState.current.targetPos = new Vector3(...pos);
        };

        const handleJoystickMove = (e) => {
            if (!enabledRef.current) return;
            const { x, y } = e.detail;
            moveState.current.forward = y < -0.2;
            moveState.current.backward = y > 0.2;
            moveState.current.left = x < -0.2;
            moveState.current.right = x > 0.2;
        };

        const handleJoystickEnd = () => {
            if (!enabledRef.current) return;
            moveState.current.forward = false;
            moveState.current.backward = false;
            moveState.current.left = false;
            moveState.current.right = false;
        };


        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('joystick-move', handleJoystickMove);
        window.addEventListener('joystick-end', handleJoystickEnd);
        window.addEventListener('move-to-hotspot', handleMoveTo);


        window.getCam = logCamera;

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('joystick-move', handleJoystickMove);
            window.removeEventListener('joystick-end', handleJoystickEnd);
            window.removeEventListener('move-to-hotspot', handleMoveTo);

            delete window.getCam;
        };
    }, [startPos, startRot, camera]);

    useEffect(() => {
        const handleReset = () => {
            console.log("[usePlayerControls] Force Camera Reset Triggered");
            camera.position.set(...startPos);
            camera.rotation.set(...startRot);
            velocity.current.set(0, 0, 0);
            rotationVelocity.current = { x: 0, y: 0 };
            
            // Correctly reset movement state
            moveState.current = {
                forward: false, backward: false, left: false, right: false,
                up: false, down: false, targetPos: null
            };
        };

        const handleManualUpdate = (e) => {
            const { pos, rot } = e.detail;
            if (pos) camera.position.set(...pos);
            if (rot) camera.rotation.set(...rot);
            // Update the 'last applied' so it doesn't immediately revert if props change
            lastAppliedPos.current = (pos || camera.position.toArray()).join(',');
        };

        window.addEventListener('force-camera-reset', handleReset);
        window.addEventListener('camera-manual-update', handleManualUpdate);
        return () => {
            window.removeEventListener('force-camera-reset', handleReset);
            window.removeEventListener('camera-manual-update', handleManualUpdate);
        };
    }, [camera, startPos, startRot]);

    useFrame((state, delta) => {
        if (!enabledRef.current) return;

        if (!isDragging.current && (Math.abs(rotationVelocity.current.x) > 0.0001 || Math.abs(rotationVelocity.current.y) > 0.0001)) {
            const euler = new Euler(0, 0, 0, 'YXZ').setFromQuaternion(camera.quaternion);
            euler.y += rotationVelocity.current.y;
            euler.x += rotationVelocity.current.x;
            euler.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.x));
            camera.quaternion.setFromEuler(euler);

            // Damping for rotation
            rotationVelocity.current.x *= 0.95;
            rotationVelocity.current.y *= 0.95;
        }

        const { forward, backward, left, right, up, down, targetPos } = moveState.current;

        // 2. Hotspot Gliding
        if (targetPos) {
            camera.position.lerp(targetPos, 5 * delta);
            if (camera.position.distanceTo(targetPos) < 0.1) {
                camera.position.copy(targetPos);
                moveState.current.targetPos = null;
                velocity.current.set(0, 0, 0);
            }
            return;
        }

        // 3. Manual Movement
        if (forward || backward || left || right || up || down) {
            const camDir = new Vector3();
            camera.getWorldDirection(camDir);
            camDir.normalize();

            const inputVector = new Vector3();
            if (forward) inputVector.add(camDir);
            if (backward) inputVector.sub(camDir);

            const strafeVec = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            if (left) inputVector.sub(strafeVec);
            if (right) inputVector.add(strafeVec);

            if (up) inputVector.y += 0.8;
            if (down) inputVector.y -= 0.8;

            if (inputVector.lengthSq() > 0) {
                inputVector.normalize();
                velocity.current.add(inputVector.multiplyScalar(ACCELERATION * delta));
            }
        }

        const damping = Math.exp(-FRICTION * delta);
        velocity.current.multiplyScalar(damping);

        if (velocity.current.length() > MAX_SPEED) velocity.current.setLength(MAX_SPEED);
        if (velocity.current.lengthSq() < 0.001) velocity.current.set(0, 0, 0);

        // Apply Movement
        if (velocity.current.lengthSq() > 0) {
            const moveStep = velocity.current.clone().multiplyScalar(delta);
            const candidatePos = camera.position.clone().add(moveStep);
            let collision = false;
            const radius = 0.5;

            for (const b of boundaries) {
                const minX = b.position[0] - b.size[0] / 2 - radius;
                const maxX = b.position[0] + b.size[0] / 2 + radius;
                const minZ = b.position[2] - b.size[2] / 2 - radius;
                const maxZ = b.position[2] + b.size[2] / 2 + radius;

                if (candidatePos.x > minX && candidatePos.x < maxX && candidatePos.z > minZ && candidatePos.z < maxZ) {
                    collision = true;
                    velocity.current.set(0, 0, 0);
                    break;
                }
            }

            if (!collision) {
                camera.position.add(moveStep);
            }
        }

        // Enforce upright camera
        const currentEuler = new Euler().setFromQuaternion(camera.quaternion, 'YXZ');
        if (Math.abs(currentEuler.z) > 0.001) {
            currentEuler.z = 0;
            camera.quaternion.setFromEuler(currentEuler);
        }

        // Sync globals for SceneEditor saving
        window.latestCameraPos = [camera.position.x, camera.position.y, camera.position.z];
        window.latestCameraRot = [camera.rotation.x, camera.rotation.y, camera.rotation.z];
    });
};
