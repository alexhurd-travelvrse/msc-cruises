import { useEffect } from 'react';

export const InputManager = () => {
    useEffect(() => {
        let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        let orbPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let targetOrbPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        let pointerDown = false;
        let scanTimer = null;
        let interactionMode = "instant";

        if (!isMobile) {
            const handleMouseMove = (e) => {
                targetOrbPos.x = e.clientX;
                targetOrbPos.y = e.clientY;
            };

            const handleMouseDown = () => {
                pointerDown = true;
                scanTimer = setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('orb-scan-start', { detail: orbPos }));
                    interactionMode = "scan";
                }, 500); 
            };

            const handleMouseUp = () => {
                pointerDown = false;
                clearTimeout(scanTimer);
                if (interactionMode === "scan") {
                    window.dispatchEvent(new CustomEvent('orb-scan-end'));
                    interactionMode = "instant";
                } else {
                    window.dispatchEvent(new CustomEvent('orb-select')); 
                }
            };
            
            const handleKeyDown = (e) => {
                if (e.code === 'Space') {
                    window.dispatchEvent(new CustomEvent('orb-scan-start', { detail: Object.assign({}, orbPos) }));
                    setTimeout(() => window.dispatchEvent(new CustomEvent('orb-scan-end')), 1500);
                }
            };

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('keydown', handleKeyDown);

            let isRunning = true;
            const loop = () => {
                if (!isRunning) return;
                orbPos.x += (targetOrbPos.x - orbPos.x) * 0.1;
                orbPos.y += (targetOrbPos.y - orbPos.y) * 0.1;

                window.dispatchEvent(new CustomEvent('orb-update', { 
                    detail: { screenPos: orbPos, cameraMove: { x: 0, y: 0 }, isMobile: false } 
                }));
                requestAnimationFrame(loop);
            };
            loop();

            return () => {
                isRunning = false;
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            // Mobile handled in AeroGlassOrb.tsx natively for touch
        }
    }, []);
    return null;
}
