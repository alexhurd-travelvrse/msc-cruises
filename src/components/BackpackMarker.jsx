import React, { useRef, useState, useEffect } from 'react';
import { Billboard, Text, Float, PositionalAudio } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGame } from '../context/GameContext';

const BackpackMarker = React.forwardRef(({ id, pos, size = 0.4, onClick, experienceId, isCollected, type, discoveryMode = 'instant', audioUrl, isStarted, isModalOpen }, ref) => {
    const { dismissedItems } = useGame();
    const groupRef = useRef();
    const ringRef = useRef();
    const bgRef = useRef();
    const borderRef = useRef();
    const textRef = useRef();
    const audioRef = useRef();
    
    const [isMaterialized, setIsMaterialized] = useState(discoveryMode === 'instant');
    const scanProgress = useRef(0);
    const orbPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const isScanning = useRef(false);
    
    const { camera } = useThree();
    const [isInsideAudioRange, setIsInsideAudioRange] = useState(false);
    const tempVec = useRef(new Vector3());

    const sceneColors = {
        '1': '#d4af37',
        '2': '#00e5ff',
        '3': '#ff8c00',
        '4': '#ff3d00',
        '5': '#ffcc00'
    };
    const color = sceneColors[experienceId] || '#ffffff';

    useEffect(() => {
        const handleOrbUpdate = (e) => {
            orbPos.current = e.detail.screenPos;
        };
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
            // Ensure audio signal is cleared on unmount
            window.dispatchEvent(new CustomEvent('msc-sensory-audio-active', { detail: { active: false } }));
        };
    }, [isMaterialized, discoveryMode]);

    // Track hot-reloaded changes from the SceneEditor
    useEffect(() => {
        setIsMaterialized(discoveryMode === 'instant');
        scanProgress.current = 0;
    }, [discoveryMode]);

    // Explicit unmount cleanup for positional audio to handle React-Three-Fiber unmount lag
    useEffect(() => {
        return () => {
            if (audioRef.current && audioRef.current.isPlaying) {
                audioRef.current.stop();
            }
        };
    }, []);

    useFrame(({ clock, camera, size: viewportSize }) => {
        if (!groupRef.current) return;

        // Visual pulse
        const time = clock.getElapsedTime();
        if (ringRef.current && isMaterialized) {
            ringRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
            ringRef.current.material.opacity = 0.4 + Math.sin(time * 3) * 0.2;
        }

        groupRef.current.getWorldPosition(tempVec.current);
        const distanceToCamera = camera.position.distanceTo(tempVec.current);
        
        // Update audio range state (2.5m threshold)
        if (discoveryMode === 'sonic' && !isCollected) {
            const inRange = distanceToCamera < 2.5;
            if (inRange !== isInsideAudioRange) {
                setIsInsideAudioRange(inRange);
                // Dispatch event to global narrator to pause/duck
                window.dispatchEvent(new CustomEvent('msc-sensory-audio-active', { detail: { active: inRange } }));
            }
            
            // Hard real-time sync for audio instance
            if (audioRef.current) {
                const isDismissed = dismissedItems && dismissedItems.includes(id);
                const shouldPlay = inRange && isStarted && !isModalOpen && !isDismissed && !isCollected;
                
                if (shouldPlay && !audioRef.current.isPlaying) {
                     // Auto-resume context if needed
                    if (audioRef.current.context.state === 'suspended') audioRef.current.context.resume();
                    audioRef.current.play();
                } else if (!shouldPlay && audioRef.current.isPlaying) {
                    audioRef.current.stop();
                }
            }
        }

        // Discovery Logic
        if (!isMaterialized) {
            if (discoveryMode === 'scan') {
                // Project 3D pos to 2D
                const vec = new Vector3();
                groupRef.current.getWorldPosition(vec);
                vec.project(camera);

                const px = (vec.x * 0.5 + 0.5) * viewportSize.width;
                const py = (vec.y * -0.5 + 0.5) * viewportSize.height;

                const dx = orbPos.current.x - px;
                const dy = orbPos.current.y - py;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 175 && vec.z < 1) { 
                    if (!isScanning.current) {
                        window.dispatchEvent(new CustomEvent('orb-scan-start', { detail: { x: px, y: py } }));
                        isScanning.current = true;
                    }
                    scanProgress.current += 1.0 / 60.0;
                    if (scanProgress.current >= 0.6) {
                        setIsMaterialized(true);
                        window.dispatchEvent(new CustomEvent('orb-scan-end')); 
                        isScanning.current = false;
                        window.dispatchEvent(new CustomEvent('trigger-confetti'));
                    }
                } else {
                    if (isScanning.current) {
                        window.dispatchEvent(new CustomEvent('orb-scan-end'));
                        isScanning.current = false;
                    }
                    scanProgress.current = Math.max(0, scanProgress.current - 0.005);
                }
                
                // Scan Visuals
                const alpha = Math.min(1, scanProgress.current / 0.6);
                groupRef.current.visible = true; 
                bgRef.current.material.opacity = alpha * 0.8;
                borderRef.current.material.opacity = alpha;
                textRef.current.fillOpacity = alpha;
                ringRef.current.material.opacity = alpha * 0.4;
                borderRef.current.scale.setScalar(0.5 + alpha * 0.5);

            } else if (discoveryMode === 'sonic') {
                const vec = new Vector3();
                groupRef.current.getWorldPosition(vec);
                const dist = camera.position.distanceTo(vec);
                
                // Proximity visibility: Fades in as you get closer
                const proximityAlpha = Math.max(0, 1 - (dist / 6.0)); 
                groupRef.current.visible = proximityAlpha > 0.05;
                bgRef.current.material.opacity = proximityAlpha * 0.4;
                borderRef.current.material.opacity = proximityAlpha * 0.8;
                textRef.current.fillOpacity = proximityAlpha * 0.7;
                ringRef.current.material.opacity = proximityAlpha * 0.2;
                borderRef.current.scale.setScalar(0.7 + proximityAlpha * 0.3);

                // Auto-materialize when very close
                if (dist < 1.8) {
                    if (navigator.vibrate) navigator.vibrate(40);
                    setIsMaterialized(true);
                }
            }
        } else {
            // Fully Materialized
            groupRef.current.visible = true;
            bgRef.current.material.opacity = 0.8;
            borderRef.current.material.opacity = 1.0;
            textRef.current.fillOpacity = 1.0;
            ringRef.current.material.opacity = 0.6;
            borderRef.current.scale.setScalar(1);
        }
    });

    if (isCollected) return null;

    const icon = '🎒';

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
                        // Clickable if materialized OR if in sonic mode (for easier interaction)
                        if (isMaterialized || (discoveryMode === 'sonic' && groupRef.current?.visible)) {
                            if (!isMaterialized) setIsMaterialized(true); // Auto-reveal on click
                            
                            if (discoveryMode === 'instant') {
                                window.dispatchEvent(new CustomEvent('captureLead', { 
                                    detail: { 
                                        timestamp: Date.now(),
                                        interaction_mode: 'instant',
                                        discovery_target: `Target_${experienceId}`,
                                        user_segment: 'General_Interest',
                                        device_type: /Android|webOS|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                                    } 
                                }));
                                window.dispatchEvent(new CustomEvent('orb-select')); 
                            } else if (discoveryMode === 'scan') {
                                window.dispatchEvent(new CustomEvent('orb-select')); 
                            }
                            onClick(e);
                        }
                    }}
                >
                    <mesh ref={ringRef} position={[0, 0, -0.01]}>
                        <ringGeometry args={[size * 0.45, size * 0.52, 64]} />
                        <meshBasicMaterial color={discoveryMode === 'scan' ? '#00e5ff' : (discoveryMode === 'sonic' ? '#FFD700' : color)} transparent opacity={isMaterialized ? 0.6 : 0} depthTest={false} />
                    </mesh>
                    
                    <mesh ref={bgRef}>
                        <circleGeometry args={[size * 0.42, 64]} />
                        <meshBasicMaterial color="#0b1e3b" transparent opacity={isMaterialized ? 0.8 : 0} depthTest={false} />
                    </mesh>

                    <mesh ref={borderRef} position={[0, 0, 0.001]}>
                        <ringGeometry args={[size * 0.4, size * 0.42, 64]} />
                        <meshBasicMaterial color={discoveryMode === 'scan' ? '#00e5ff' : (discoveryMode === 'sonic' ? '#FFD700' : color)} transparent opacity={isMaterialized ? 1 : 0} depthTest={false} />
                    </mesh>

                    <Text 
                        ref={textRef}
                        position={[0, 0, 0.02]} 
                        fontSize={size * 0.45} 
                        depthTest={false}
                        color={color}
                        fillOpacity={isMaterialized ? 1 : 0}
                    >
                        {icon}
                    </Text>
                </Billboard>

                {isStarted && !isCollected && discoveryMode === 'sonic' && audioUrl && (
                    <PositionalAudio 
                        ref={audioRef}
                        url={audioUrl} 
                        distanceModel="exponential" 
                        rolloffFactor={8.0} // Even steeper for absolute silence
                        refDistance={0.5} 
                        volume={isInsideAudioRange ? 1 : 0} 
                        autoplay={false}
                        loop 
                    />
                )}

                {isStarted && ((discoveryMode === 'sonic' && !isCollected) || isMaterialized) && (
                    <pointLight 
                        intensity={discoveryMode === 'sonic' ? 0.8 + Math.sin(Date.now()*0.003)*0.4 : 1.5} 
                        color={discoveryMode === 'sonic' ? '#FFD700' : color} 
                        distance={3} 
                        decay={1.5} 
                    />
                )}
            </Float>
        </group>
    );
});

export default BackpackMarker;
