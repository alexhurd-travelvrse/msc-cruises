import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Raycaster, Vector2 } from 'three';

export const useManualRaycaster = (coinRef, chestRef, onCoinClick, onActivityClick) => {
    const { camera, gl, scene } = useThree();

    useEffect(() => {
        const raycaster = new Raycaster();
        const mouse = new Vector2();

        const handleClick = (event) => {
            // Calculate mouse position in normalized device coordinates (-1 to +1)
            const rect = gl.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Update the raycaster
            raycaster.setFromCamera(mouse, camera);

            // Check intersections with coin
            if (coinRef.current) {
                const coinIntersects = raycaster.intersectObject(coinRef.current, true);
                if (coinIntersects.length > 0) {
                    console.log('Manual raycast hit coin!');
                    onCoinClick({ stopPropagation: () => { } });
                    return;
                }
            }

            // Check intersections with activity
            if (chestRef.current) {
                const chestIntersects = raycaster.intersectObject(chestRef.current, true);
                if (chestIntersects.length > 0) {
                    console.log('Manual raycast hit activity!');
                    onActivityClick({ stopPropagation: () => { } });
                    return;
                }
            }
        };

        gl.domElement.addEventListener('click', handleClick);

        return () => {
            gl.domElement.removeEventListener('click', handleClick);
        };
    }, [camera, gl, scene, coinRef, chestRef, onCoinClick, onActivityClick]);
};
