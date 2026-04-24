import React, { useRef, useState, useEffect } from 'react';
import { Billboard, Text, Float, PositionalAudio, Image } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';

const BackpackMarker = React.forwardRef(({ id, pos, size = 0.4, onClick, experienceId, isCollected, type, discoveryMode = 'instant', audioUrl, isStarted, isModalOpen }, ref) => {
    const { dismissedItems } = useGame();
    const groupRef = useRef();
    const ringRef = useRef();
    const bgRef = useRef();
    const borderRef = useRef();
    const imageRef = useRef();
    const audioRef = useRef();
    
    const [isMaterialized, setIsMaterialized] = useState(discoveryMode === 'instant');
    const scanProgress = useRef(0);
    const orbPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const isScanning = useRef(false);
    
    const { camera } = useThree();
    const [isInsideAudioRange, setIsInsideAudioRange] = useState(false);
    const tempVec = useRef(new Vector3());

    const { manifest } = useInfluencer();
    const primaryColor = manifest?.client_metadata?.brand_assets?.primary_color || '#00e5ff';

    // "The floating backpack icon is a backpack"
    const iconUrl = type === 'medal' || type === 'collectible' ? '/assets/medal_icon.png' : '/assets/backpack_icon.png';

    useEffect(() => {
        const handleOrbUpdate = (e) => { orbPos.current = e.detail.screenPos; };
        const handleScanStart = () => { isScanning.current = true; };
        const handleScanEnd = () => { 
            isScanning.current = false;
            if (!isMaterialized && discoveryMode === 'scan') scanProgress.current = 0; 
        };

        window.addEventListener('orb-update', handleOrbUpdate);
        window.addEventListener('orb-scan-start', handleScanStart);
        window.addEventListener('orb-scan-end', handleScanEnd);
        return () => {
            window.removeEventListener('orb-update', handleOrbUpdate);
            window.removeEventListener('orb-scan-start', handleScanStart);
            window.removeEventListener('orb-scan-end', handleScanEnd);
        };
    }, [isMaterialized, discoveryMode]);

    useFrame(({ clock, camera, size: viewportSize }) => {
        if (!groupRef.current) return;

        const time = clock.getElapsedTime();
        if (ringRef.current && isMaterialized) {
            ringRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
            ringRef.current.material.opacity = 0.4 + Math.sin(time * 3) * 0.2;
        }

        groupRef.current.getWorldPosition(tempVec.current);
        const distanceToCamera = camera.position.distanceTo(tempVec.current);
        
        if (discoveryMode === 'sonic' && !isCollected) {
            const inRange = distanceToCamera < 3.5;
            if (inRange !== isInsideAudioRange) {
                setIsInsideAudioRange(inRange);
            }
            
            if (audioRef.current) {
                const isDismissed = dismissedItems?.includes(id);
                const shouldPlay = inRange && isStarted && !isModalOpen && !isDismissed && !isCollected;
                if (shouldPlay && !audioRef.current.isPlaying) {
                    audioRef.current.play();
                } else if (!shouldPlay && audioRef.current.isPlaying) {
                    audioRef.current.stop();
                }
            }
        }

        if (!isMaterialized) {
            if (discoveryMode === 'scan') {
                const vec = new Vector3();
                groupRef.current.getWorldPosition(vec);
                vec.project(camera);
                const px = (vec.x * 0.5 + 0.5) * viewportSize.width;
                const py = (vec.y * -0.5 + 0.5) * viewportSize.height;
                const dx = orbPos.current.x - px;
                const dy = orbPos.current.y - py;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150 && vec.z < 1) { 
                    scanProgress.current += 1.0 / 60.0;
                    if (scanProgress.current >= 0.6) {
                        setIsMaterialized(true);
                        window.dispatchEvent(new CustomEvent('trigger-confetti'));
                        window.dispatchEvent(new CustomEvent('orb-scan-end')); 
                    }
                } else {
                    scanProgress.current = Math.max(0, scanProgress.current - 0.01);
                }
                
                const alpha = Math.min(1, scanProgress.current / 0.6);
                groupRef.current.visible = alpha > 0.01; 
                if (bgRef.current?.material) bgRef.current.material.opacity = alpha * 0.8;
                if (borderRef.current?.material) borderRef.current.material.opacity = alpha;
                if (imageRef.current?.material) imageRef.current.material.opacity = alpha;
            } else if (discoveryMode === 'sonic') {
                const proximityAlpha = Math.max(0, 1 - (distanceToCamera / 6.0)); 
                groupRef.current.visible = proximityAlpha > 0.05;
                if (bgRef.current?.material) bgRef.current.material.opacity = proximityAlpha * 0.4;
                if (borderRef.current?.material) borderRef.current.material.opacity = proximityAlpha * 0.8;
                if (imageRef.current?.material) imageRef.current.material.opacity = proximityAlpha;
                if (distanceToCamera < 1.8) setIsMaterialized(true);
            }
        } else {
            groupRef.current.visible = true;
            if (bgRef.current?.material) bgRef.current.material.opacity = 0.8;
            if (borderRef.current?.material) borderRef.current.material.opacity = 1.0;
            if (imageRef.current?.material) imageRef.current.material.opacity = 1.0;
        }
    });

    if (isCollected) return null;

    const markerColor = discoveryMode === 'scan' ? '#00e5ff' : (discoveryMode === 'sonic' ? '#FFD700' : primaryColor);

    return (
        <group position={pos} ref={(el) => {
            groupRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
        }}>
            <Float
                speed={isMaterialized ? 2 : 0} 
                rotationIntensity={isMaterialized ? 0.5 : 0} 
                floatIntensity={isMaterialized ? 0.5 : 0}
                floatingRange={[-0.05, 0.05]}
            >
                <Billboard
                    follow={true}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (groupRef.current?.visible) {
                            if (!isMaterialized) {
                                setIsMaterialized(true);
                                window.dispatchEvent(new CustomEvent('trigger-confetti'));
                            }
                            onClick(e);
                        }
                    }}
                >
                    {/* The Center Pulse Dot */}
                    <mesh position={[0, 0, 0.01]}>
                        <circleGeometry args={[size * 0.15, 32]} />
                        <meshBasicMaterial color="white" transparent opacity={isMaterialized ? 0.9 : 0} />
                    </mesh>

                    <mesh ref={ringRef} position={[0, 0, -0.01]}>
                        <ringGeometry args={[size * 0.35, size * 0.42, 64]} />
                        <meshBasicMaterial color={markerColor} transparent opacity={isMaterialized ? 0.6 : 0} />
                    </mesh>
                    
                    <mesh ref={bgRef}>
                        <circleGeometry args={[size * 0.32, 64]} />
                        <meshBasicMaterial color="#000" transparent opacity={isMaterialized ? 0.4 : 0} />
                    </mesh>

                    <mesh ref={borderRef} position={[0, 0, 0.001]}>
                        <ringGeometry args={[size * 0.3, size * 0.32, 64]} />
                        <meshBasicMaterial color={markerColor} transparent opacity={isMaterialized ? 1 : 0} />
                    </mesh>
                </Billboard>

                {isStarted && !isCollected && discoveryMode === 'sonic' && audioUrl && (
                    <PositionalAudio 
                        ref={audioRef}
                        url={audioUrl} 
                        distanceModel="exponential" 
                        rolloffFactor={8.0} 
                        refDistance={0.5} 
                        volume={isInsideAudioRange ? 1 : 0} 
                        autoplay={false}
                        loop 
                    />
                )}

                {isStarted && isMaterialized && (
                    <pointLight 
                        intensity={1.5} 
                        color={markerColor} 
                        distance={3} 
                        decay={1.5} 
                    />
                )}
            </Float>
        </group>
    );
});

export default BackpackMarker;
