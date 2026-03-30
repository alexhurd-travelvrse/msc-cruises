import React, { useState, useRef, useEffect } from 'react';

const Joystick = ({ size = 120, color = '#00e5ff' }) => {
    const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
    const [isActive, setIsActive] = useState(false);
    const containerRef = useRef(null);
    const joystickId = useRef(Math.random().toString(36).substr(2, 9));

    const handleStart = (e) => {
        setIsActive(true);
        handleMove(e);
    };

    const handleMove = (e) => {
        if (!isActive && e.type !== 'touchstart') return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxRadius = rect.width / 2;

        if (distance > maxRadius) {
            deltaX *= maxRadius / distance;
            deltaY *= maxRadius / distance;
        }

        setStickPos({ x: deltaX, y: deltaY });

        // Dispatch normalized values (-1 to 1)
        const normalizedX = deltaX / maxRadius;
        const normalizedY = deltaY / maxRadius;

        window.dispatchEvent(new CustomEvent('joystick-move', {
            detail: { x: normalizedX, y: normalizedY }
        }));
    };

    const handleEnd = () => {
        setIsActive(false);
        setStickPos({ x: 0, y: 0 });
        window.dispatchEvent(new CustomEvent('joystick-end'));
    };

    useEffect(() => {
        if (isActive) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        } else {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isActive]);

    return (
        <div
            ref={containerRef}
            className="joystick-container"
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            style={{
                position: 'fixed',
                bottom: '160px',
                left: '40px',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: `2px solid ${color}44`,
                zIndex: 1000,
                touchAction: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                className="joystick-handle"
                style={{
                    width: `${size / 2}px`,
                    height: `${size / 2}px`,
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 20px ${color}66`,
                    transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
                    transition: isActive ? 'none' : 'transform 0.1s ease-out',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

export default Joystick;
