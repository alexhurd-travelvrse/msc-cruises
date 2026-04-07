import React, { useRef, useState, useEffect } from 'react';
import { Billboard, Text, Float, PositionalAudio } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

const BackpackMarker = React.forwardRef(({ pos, size = 0.4, onClick, experienceId, isCollected, type, discoveryMode = 'instant', audioUrl }, ref) => {
    const groupRef = useRef();
    const ringRef = useRef();
    const bgRef = useRef();
    const borderRef = useRef();
    const textRef = useRef();
    
    const [isMaterialized, setIsMaterialized] = useState(discoveryMode === 'instant');
    const scanProgress = useRef(0);
    const orbPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const isScanning = useRef(false);
    
    const { camera } = useThree();

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
        };
    }, [isMaterialized, discoveryMode]);

    // Track hot-reloaded changes from the SceneEditor
    useEffect(() => {
        setIsMaterialized(discoveryMode === 'instant');
        scanProgress.current = 0;
    }, [discoveryMode]);

    useFrame(({ clock, camera, size: viewportSize }) => {
        if (!groupRef.current) return;

        // Visual pulse
        const time = clock.getElapsedTime();
        if (ringRef.current && isMaterialized) {
            ringRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
            ringRef.current.material.opacity = 0.4 + Math.sin(time * 3) * 0.2;
        }

        // Logic for Scan Mode
        if (discoveryMode === 'scan' && !isMaterialized) {
            // Project 3D pos to 2D
            const vec = new Vector3();
            groupRef.current.getWorldPosition(vec);
            vec.project(camera);

            const px = (vec.x * 0.5 + 0.5) * viewportSize.width;
            const py = (vec.y * -0.5 + 0.5) * viewportSize.height;

            const dx = orbPos.current.x - px;
            const dy = orbPos.current.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // If focus point (mouse or center screen) is within generous 175px radius
            if (dist < 175 && vec.z < 1) { // vec.z < 1 ensures it's in front of camera
                if (!isScanning.current) {
                    window.dispatchEvent(new CustomEvent('orb-scan-start', { detail: { x: px, y: py } }));
                    isScanning.current = true;
                }
                
                scanProgress.current += 1.0 / 60.0; // Assume 60fps
                
                if (scanProgress.current >= 0.6) { // Reduced from 1.5s to 0.6s for easier discovery
                    setIsMaterialized(true);
                    window.dispatchEvent(new CustomEvent('orb-scan-end')); // stop pulsar
                    isScanning.current = false;
                    console.log("Direct Lead Captured: High Intent/Qualified Lead (Scan Mode)");
                    window.dispatchEvent(new CustomEvent('captureLead', { 
                        detail: { 
                            timestamp: Date.now(),
                            interaction_mode: 'scan',
                            discovery_target: `Target_${experienceId}`,
                            user_segment: 'High_Intent_Luxury',
                            device_type: /Android|webOS|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                        } 
                    }));
                }
            } else {
                if (isScanning.current) {
                    window.dispatchEvent(new CustomEvent('orb-scan-end'));
                    isScanning.current = false;
                }
                // Very slow decay instead of aggressive hiding, acting as "stickiness"
                scanProgress.current = Math.max(0, scanProgress.current - 0.005);
            }
            
            // Visuals while not materialized
            if (bgRef.current && borderRef.current && textRef.current && ringRef.current && groupRef.current) {
                const alpha = Math.min(1, scanProgress.current / 0.6);
                
                // Aggressively hide the entire object from the Engine if alpha is 0
                groupRef.current.visible = alpha > 0.02;

                bgRef.current.material.opacity = alpha * 0.8;
                borderRef.current.material.opacity = alpha;
                textRef.current.fillOpacity = alpha; // Drei Text uses fillOpacity
                ringRef.current.material.opacity = alpha * 0.4;
                
                // Ring expands as progress fills (like a circular progress ring filling)
                borderRef.current.scale.setScalar(0.5 + alpha * 0.5);
            }
        } else if (discoveryMode === 'sonic' && !isMaterialized) {
            if (groupRef.current) groupRef.current.visible = false; // Sonic relies on distance
        } else {
            // Instant or already materialized
            if (groupRef.current) groupRef.current.visible = true;
        }

        // Logic for Sonic Mode vibrations on mobile
        if (discoveryMode === 'sonic' && !isMaterialized) {
            const vec = new Vector3();
            groupRef.current.getWorldPosition(vec);
            const dist = camera.position.distanceTo(vec);
            if (dist < 1.0 && navigator.vibrate) {
                navigator.vibrate(40);
                setIsMaterialized(true);
                console.log("Direct Lead Captured: Sensory Engagement (Sonic Mode)");
                window.dispatchEvent(new CustomEvent('captureLead', { 
                    detail: { 
                        timestamp: Date.now(),
                        interaction_mode: 'sonic',
                        discovery_target: `Target_${experienceId}`,
                        user_segment: 'Sensory_Engagement',
                        device_type: /Android|webOS|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                    } 
                }));
            }
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
                        // Only clickable if materialized
                        if (isMaterialized) {
                            if (discoveryMode === 'instant') {
                                console.log("Direct Lead Captured: General Interest (Instant Mode)");
                                window.dispatchEvent(new CustomEvent('captureLead', { 
                                    detail: { 
                                        timestamp: Date.now(),
                                        interaction_mode: 'instant',
                                        discovery_target: `Target_${experienceId}`,
                                        user_segment: 'General_Interest',
                                        device_type: /Android|webOS|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                                    } 
                                }));
                            }
                            window.dispatchEvent(new CustomEvent('orb-select')); // Dispatch select visually
                            onClick(e);
                        }
                    }}
                >
                    <mesh ref={ringRef} position={[0, 0, -0.01]}>
                        <ringGeometry args={[size * 0.45, size * 0.52, 64]} />
                        <meshBasicMaterial color={discoveryMode === 'scan' ? '#00e5ff' : color} transparent opacity={isMaterialized ? 0.6 : 0} depthTest={false} />
                    </mesh>
                    
                    <mesh ref={bgRef}>
                        <circleGeometry args={[size * 0.42, 64]} />
                        <meshBasicMaterial color="#0b1e3b" transparent opacity={isMaterialized ? 0.8 : 0} depthTest={false} />
                    </mesh>

                    <mesh ref={borderRef} position={[0, 0, 0.001]}>
                        <ringGeometry args={[size * 0.4, size * 0.42, 64]} />
                        <meshBasicMaterial color={discoveryMode === 'scan' ? '#00e5ff' : color} transparent opacity={isMaterialized ? 1 : 0} depthTest={false} />
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

                {discoveryMode === 'sonic' && !isMaterialized && audioUrl && (
                     <PositionalAudio 
                         url={audioUrl} 
                         distanceModel="exponential" 
                         rolloffFactor={2} 
                         refDistance={0.5} 
                         autoplay 
                         loop 
                     />
                )}

                {isMaterialized && <pointLight intensity={1.5} color={color} distance={2} decay={2} />}
            </Float>
        </group>
    );
});

export default BackpackMarker;
