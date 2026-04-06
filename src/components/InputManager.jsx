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
            document.body.style.cursor = 'none';
            
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

                const cx = window.innerWidth / 2;
                const cy = window.innerHeight / 2;
                const dx = orbPos.x - cx;
                const dy = orbPos.y - cy;
                const MathDistSq = dx * dx + dy * dy;
                const maxDim = Math.min(window.innerWidth, window.innerHeight);
                const deadzoneRadiusSq = (maxDim * 0.1) * (maxDim * 0.1);

                let moveX = 0;
                let moveY = 0;
                
                if (MathDistSq > deadzoneRadiusSq) {
                     const dist = Math.sqrt(MathDistSq);
                     const factor = Math.min(1, Math.abs(dist - maxDim * 0.1) / (maxDim * 0.4));
                     moveX = (dx / dist) * factor;
                     moveY = (dy / dist) * factor;
                }

                window.dispatchEvent(new CustomEvent('orb-update', { 
                    detail: { screenPos: orbPos, cameraMove: { x: moveX, y: moveY }, isMobile: false } 
                }));
                requestAnimationFrame(loop);
            };
            loop();

            return () => {
                isRunning = false;
                document.body.style.cursor = 'auto';
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
