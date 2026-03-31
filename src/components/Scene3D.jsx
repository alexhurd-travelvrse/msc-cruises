import React, { useRef, Suspense } from 'react';
import { Environment, useTexture, Billboard, Text, Float, TransformControls, useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sceneConfig } from '../data/sceneConfig';
import { usePlayerControls } from '../hooks/usePlayerControls';
import { useManualRaycaster } from '../hooks/useManualRaycaster';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';

import SparkModel from './SparkModel';
import ProceduralBell from './ProceduralBell';
import Towel from './Towel';
import InteractiveMenu from './InteractiveMenu';
import ProceduralWineGlass from './ProceduralWineGlass';
import ProceduralGelato from './ProceduralGelato';
import Confetti from './Confetti';
import ProceduralTVRemote from './ProceduralTVRemote';
import GymBall from './GymBall';

// Helper component to wrap objects for Editor Mode
const TransformWrapper = ({ id, activeId, isEditorActive, handleTransform, mode = "translate", children }) => {
    if (isEditorActive && activeId === id) {
        return (
            <TransformControls mode={mode} onMouseUp={(e) => handleTransform(id, e)}>
                {children}
            </TransformControls>
        );
    }
    return <>{children}</>;
};

import BackpackMarker from './BackpackMarker';

const DynamicModel = ({ config, modelScale, onSplatLoad }) => {
    const path = config.modelPath || "/models/1.splat";
    const modelRotation = React.useMemo(() => config.modelRotation || [0, 0, 0], [config.modelRotation]);

    console.log('%c[DynamicModel] Rendering with path:', 'color: #ff00ff; font-weight: bold;', path);
    console.log('[DynamicModel] Config:', config);
    console.log('[DynamicModel] modelScale:', modelScale);

    try {
        return (
            <SparkModel
                url={path}
                scale={modelScale}
                rotation={modelRotation}
                position={[0, 0, 0]}
                onLoad={onSplatLoad}
            />
        );
    } catch (error) {
        console.error('[DynamicModel] Error rendering SparkModel:', error);
        return null;
    }
};

const RealisticMSCCoin = React.forwardRef(({ pos, size, onClick, isCollected }, ref) => {
    const groupRef = useRef();
    const coinTexture = useTexture('/textures/msc_sovereign_coin.png');
    
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.05;
        }
    });

    return (
        <group
            position={pos}
            ref={(el) => {
                groupRef.current = el;
                if (typeof ref === 'function') ref(el);
                else if (ref) ref.current = el;
            }}
            visible={!isCollected}
        >
            {/* Click sphere */}
            <mesh onClick={onClick} onPointerDown={onClick}>
                <sphereGeometry args={[size * 2.5, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} depthTest={false} />
            </mesh>

            {/* 3D LUX COIN */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[size, size, 0.08, 64]} />
                <meshStandardMaterial 
                    map={coinTexture} 
                    metalness={1} 
                    roughness={0.1} 
                    emissive="#FFD700"
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Glow Aura */}
            <Billboard>
                <mesh>
                    <circleGeometry args={[size * 1.5, 64]} />
                    <meshBasicMaterial color="#FFD700" transparent opacity={0.15} depthTest={false} />
                </mesh>
            </Billboard>

            <pointLight intensity={3} distance={5} color="#FFD700" />
        </group>
    );
});

const TexturedCoin = React.forwardRef((props, ref) => {
    return <RealisticMSCCoin {...props} ref={ref} />;
});

const RealisticActivity = React.forwardRef(({ pos, size, onClick, isCollected }, ref) => {
    return (
        <group position={pos} ref={ref} visible={!isCollected}>
            <mesh onClick={onClick} onPointerDown={onClick}>
                <sphereGeometry args={[size * 3, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} depthTest={false} />
            </mesh>

            <Billboard>
                <mesh>
                    <ringGeometry args={[size * 0.45, size * 0.52, 64]} />
                    <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} depthTest={false} />
                </mesh>
                <mesh position={[0, 0, -0.01]}>
                    <circleGeometry args={[size * 0.42, 64]} />
                    <meshBasicMaterial color="#0b1e3b" transparent opacity={0.8} depthTest={false} />
                </mesh>
                <Text font="/assets/Inter.ttf" fontSize={size * 0.45} position={[0, 0, 0.01]} depthTest={false}>
                    ✨
                </Text>
            </Billboard>

            <pointLight intensity={2} color="#00e5ff" distance={3} />
        </group>
    );
});

const ProceduralRing = React.forwardRef(({ pos, size, onClick, isCollected }, ref) => {
    return (
        <group position={pos} ref={ref} visible={!isCollected}>
            <mesh onClick={onClick} onPointerDown={onClick}>
                <sphereGeometry args={[size * 3, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthTest={false} />
            </mesh>

            <Billboard position={[0, 0.5, 0]}>
                <Text font="/assets/Inter.ttf"
                    fontSize={0.1}
                    color="white"
                    outlineWidth={0.01}
                    outlineColor="black"
                >
                    MAGIC RING
                </Text>
            </Billboard>

            <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={1000}>
                <torusGeometry args={[size, 0.05, 16, 64]} />
                <meshStandardMaterial
                    color="#FFD700"
                    metalness={1}
                    roughness={0.1}
                    emissive="#DAA520"
                    emissiveIntensity={0.2}
                    depthTest={false}
                    depthWrite={false}
                />
            </mesh>
            <pointLight intensity={2} color="#FFD700" distance={2} />
        </group>
    );
});

const TelephoneBox = ({ pos, size, onClick, chestRef }) => {
    return (
        <group position={pos} ref={chestRef}>
            {/* Interaction sphere */}
            <mesh onClick={onClick} onPointerDown={onClick}>
                <sphereGeometry args={[size * 4, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthTest={false} />
            </mesh>

            <Billboard position={[0, 1.2, 0]}>
                <Text font="/assets/Inter.ttf"
                    fontSize={0.12}
                    color="white"
                    outlineWidth={0.01}
                    outlineColor="black"
                    position={[0, 1.2, 0]}
                >
                    SPEAKEASY ENTRY
                </Text>
            </Billboard>

            {/* Telephone Box Body */}
            <group scale={size * 5}>
                {/* Main Pillar */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[0.8, 2, 0.8]} />
                    <meshStandardMaterial color="#c41212" metalness={0.5} roughness={0.3} />
                </mesh>
                {/* Top Cap */}
                <mesh position={[0, 1.05, 0]}>
                    <boxGeometry args={[0.9, 0.15, 0.9]} />
                    <meshStandardMaterial color="#c41212" />
                </mesh>
                <mesh position={[0, 1.15, 0]}>
                    <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#c41212" />
                </mesh>

                {/* Glass Panels (Front) */}
                <mesh position={[0, 0.2, 0.41]}>
                    <planeGeometry args={[0.6, 1.4]} />
                    <meshStandardMaterial color="#ADD8E6" transparent opacity={0.6} metalness={1} roughness={0} />
                </mesh>

                {/* THE FOUR DIALS */}
                <group position={[0, 0, 0.42]}>
                    {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
                        <mesh key={i} position={[x * 0.12, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.04, 0.04, 0.05, 12]} />
                            <meshStandardMaterial color="silver" metalness={1} roughness={0.1} />
                            {/* Dial marker */}
                            <mesh position={[0, 0.03, 0]}>
                                <boxGeometry args={[0.01, 0.01, 0.04]} />
                                <meshBasicMaterial color="red" />
                            </mesh>
                        </mesh>
                    ))}
                </group>

                <pointLight position={[0, 0.5, 0.5]} intensity={1.5} color="#ffffff" distance={2} />
            </group>
        </group>
    );
};

const RacingCarModel = ({ modelPath }) => {
    const { scene } = useGLTF(modelPath);
    const clonedScene = React.useMemo(() => scene.clone(), [scene]);

    React.useEffect(() => {
        clonedScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [clonedScene]);

    return <primitive object={clonedScene} scale={0.5} />;
};

const RacingCar = React.forwardRef(({ pos, size, onClick, isCollected, modelPath }, ref) => {
    return (
        <group position={pos} ref={ref} visible={!isCollected}>
            <mesh onClick={onClick} onPointerDown={onClick}>
                <sphereGeometry args={[size * 4, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthTest={false} />
            </mesh>

            <Billboard position={[0, 1.2, 0]}>
                <Text font="/assets/Inter.ttf"
                    fontSize={0.12}
                    color="white"
                    outlineWidth={0.01}
                    outlineColor="black"
                    position={[0, 0.8, 0]}
                >
                    RACING SIMULATOR
                </Text>
            </Billboard>

            <group scale={size * 4}>
                {modelPath ? (
                    <RacingCarModel modelPath={modelPath} />
                ) : (
                    <group scale={0.4}>
                        {/* Fallback Car Body */}
                        <mesh position={[0, 0.2, 0]}>
                            <boxGeometry args={[1.5, 0.4, 0.8]} />
                            <meshStandardMaterial color="#ff0000" metalness={0.7} roughness={0.2} />
                        </mesh>
                    </group>
                )}
                <pointLight position={[0, 1, 0]} intensity={2} color="#ff0000" distance={3} />
            </group>
        </group>
    );
});



const ProperAvatar = () => {
    return null; // Logic removed as requested
};

const RemoteModel = React.forwardRef(({ pos, rotation, size = 0.1, onClick, modelPath }, ref) => {
    const { scene } = useGLTF(modelPath || '/models/remotecontrol.glb');
    const groupRef = useRef();
    const clonedScene = React.useMemo(() => scene.clone(), [scene]);

    // Flashing Animation
    useFrame(({ clock }) => {
        if (groupRef.current) {
            const t = clock.getElapsedTime();
            const scalePulse = 1 + Math.sin(t * 8) * 0.1;
            // Apply pulse to the base size
            groupRef.current.scale.set(size * scalePulse, size * scalePulse, size * scalePulse);
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        onClick(e);
    };

    return (
        <group position={pos} rotation={rotation} ref={(el) => {
            groupRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
        }}>
            <primitive object={clonedScene} onClick={handleClick} />

            {/* Flashing Light for effect */}
            <pointLight position={[0, 0.2, 0]} color="#00ff00" intensity={1} distance={1} />

            <Billboard position={[0, 0.5, 0]}>
                <Text font="/assets/Inter.ttf" fontSize={0.8} color="#00ff00" outlineWidth={0.05} outlineColor="black">
                    Check out the wi-fi options
                </Text>
            </Billboard>
        </group>
    );
});


// Local definitions to match Experience 1 & 4 logic for stability
const GreenStar = ({ pos, rot, size, onClick, isCollected }) => {
    // Flash animation ref
    const materialRef = React.useRef();
    const groupRef = React.useRef();

    // Animate flashing
    useFrame(({ clock }) => {
        if (materialRef.current && groupRef.current) {
            const t = clock.getElapsedTime();
            // Pulse between 0.4 and 1.0 intensity
            materialRef.current.emissiveIntensity = 0.7 + Math.sin(t * 8) * 0.3;
            // Also pulse scale slightly
            const scalePulse = 1 + Math.sin(t * 8) * 0.1;
            groupRef.current.scale.set(1 * scalePulse, 1 * scalePulse, 1 * scalePulse);
        }
    });

    const starShape = React.useMemo(() => {
        const shape = new THREE.Shape();
        const outerRadius = 0.5;
        const innerRadius = 0.25;
        const spikes = 5;
        const step = Math.PI / spikes;

        shape.moveTo(0, outerRadius);
        for (let i = 0; i < 2 * spikes; i++) {
            const radius = (i % 2 === 0) ? outerRadius : innerRadius;
            const x = Math.cos(i * step + Math.PI / 2) * radius;
            const y = Math.sin(i * step + Math.PI / 2) * radius;
            shape.lineTo(x, y);
        }
        shape.closePath();
        return shape;
    }, []);

    const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 };

    return (
        <group position={pos} rotation={[rot[0], rot[1], rot[2]]} visible={!isCollected} ref={groupRef}>
            {/* Interaction Sphere for easier clicking */}
            <mesh onClick={onClick} onPointerDown={onClick}>
                <sphereGeometry args={[size * 10, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthTest={false} />
            </mesh>

            <mesh renderOrder={1000} scale={[size, size, size]}>
                <extrudeGeometry args={[starShape, extrudeSettings]} />
                <meshStandardMaterial ref={materialRef} color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
            </mesh>
            <pointLight position={[0, 0, 0.5]} color="#00ff00" intensity={2} distance={3} />
            <Billboard position={[0, 0.15, 0]}>
                <Text font="/assets/Inter.ttf" fontSize={0.1} color="#00ff00" outlineWidth={0.005} outlineColor="black">
                    Check out the view
                </Text>
            </Billboard>
        </group>
    );
};

const TowelLocal = React.forwardRef(({ pos, size, onClick, isCollected }, ref) => {
    // Generate Realistic Fabric Texture
    const fabricTexture = React.useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#22ffff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 512; i += 4) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        return tex;
    }, []);

    // Explicit cleanup to prevent WebGL context leaks
    React.useEffect(() => {
        return () => {
            if (fabricTexture) fabricTexture.dispose();
        };
    }, [fabricTexture]);

    return (
        <group position={pos} ref={ref} visible={!isCollected}>
            {/* Interaction Sphere - Matches RealisticActivity */}
            <mesh onClick={onClick} onPointerDown={onClick}>
                <sphereGeometry args={[size * 4, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthTest={false} />
            </mesh>

            <group scale={[size, size, size]} rotation={[0.1, Math.PI / 4, 0.05]}>
                {/* Towel Body */}
                <mesh rotation={[0, 0, Math.PI / 2]} renderOrder={1000}>
                    <cylinderGeometry args={[0.5, 0.5, 2.0, 32, 8, false]} />
                    <meshPhysicalMaterial
                        map={fabricTexture}
                        roughness={0.9}
                        metalness={0}
                        sheen={1.0}
                        transparent
                        opacity={1}
                        depthTest={false}
                        depthWrite={false}
                    />
                </mesh>
                {/* Ends */}
                <mesh position={[1.01, 0, 0]} rotation={[0, 0, Math.PI / 2]} renderOrder={1000}>
                    <circleGeometry args={[0.48, 32]} />
                    <meshBasicMaterial color="#00b8cc" depthTest={false} depthWrite={false} />
                </mesh>
                <mesh position={[-1.01, 0, 0]} rotation={[0, 0, -Math.PI / 2]} renderOrder={1000}>
                    <circleGeometry args={[0.48, 32]} />
                    <meshBasicMaterial color="#00b8cc" depthTest={false} depthWrite={false} />
                </mesh>
            </group>

            <pointLight position={[0, 0.5, 0.2]} color="#00e5ff" intensity={3} distance={4} />
        </group>
    );
});

const GymBallLocal = React.forwardRef(({ pos, size, onClick, isCollected }, ref) => {
    return (
        <group position={pos} ref={ref} visible={!isCollected}>
            {/* Interaction Sphere */}
            <mesh onClick={onClick} onPointerDown={onClick}>
                <sphereGeometry args={[size * 3, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthTest={false} />
            </mesh>

            {/* Gym Ball */}
            <mesh renderOrder={1000}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshPhongMaterial
                    color="#2e7d32"
                    specular="#ffffff"
                    shininess={50}
                    depthTest={false}
                    depthWrite={false}
                />
            </mesh>

            <pointLight intensity={1} distance={2} color="#ffffff" position={[0, size, 0]} />
        </group>
    );
});

const Scene3D = ({ experienceId, isInteractionActive, isEditorMode, activeEditorObject, isStarted = false, itemsViewed = [] }) => {
    const { publicConfig } = useInfluencer();
    const staticConfig = sceneConfig[experienceId] || sceneConfig['default'];
    // Merge: publicConfig.experiences[experienceId] contains items/coin data from truth
    const roomConfig = publicConfig.experiences?.[experienceId] || {};

    // Standardize: Convert degrees from roomConfig (truth) to radians for 3D engine
    const toRad = (arr) => arr ? arr.map(d => d * (Math.PI / 180)) : arr;
    
    // Create a normalized config where all rotations are radians
    const config = React.useMemo(() => {
        const merged = { ...staticConfig, ...roomConfig };
        
        // If it came from roomConfig (json truth), it's likely degrees
        if (roomConfig.startRot) merged.startRot = toRad(roomConfig.startRot);
        if (roomConfig.coin?.rotation) merged.coinRotation = toRad(roomConfig.coin.rotation);
        if (roomConfig.activityRot) merged.activityRot = toRad(roomConfig.activityRot);
        if (roomConfig.remoteRot) merged.remoteRot = toRad(roomConfig.remoteRot);
        if (roomConfig.menuRot) merged.menuRot = toRad(roomConfig.menuRot);
        if (roomConfig.wineRot) merged.wineRot = toRad(roomConfig.wineRot);
        if (roomConfig.rewardRot) merged.rewardRot = toRad(roomConfig.rewardRot);
        if (roomConfig.gaudiRot) merged.gaudiRot = toRad(roomConfig.gaudiRot);
        
        if (roomConfig.extraObjects) {
            merged.extraObjects = roomConfig.extraObjects.map(obj => ({
                ...obj,
                rot: toRad(obj.rot)
            }));
        }
        
        return merged;
    }, [staticConfig, roomConfig]);

    // Debug logging for extra objects to find GymBall leak
    React.useEffect(() => {
        if (config.extraObjects && config.extraObjects.length > 0) {
            console.log(`[Scene3D] Exp ${experienceId} Extra Objects:`, JSON.stringify(config.extraObjects));
        }
    }, [experienceId, config]);
    const [showWineGlass, setShowWineGlass] = React.useState(false);
    const [showGelato, setShowGelato] = React.useState(false);
    const [showConfetti, setShowConfetti] = React.useState(false);
    const [isSplatLoaded, setIsSplatLoaded] = React.useState(false);
    // Production: icons show after splat loads + user starts; coin shows after icon interaction
    const [isItemsAllowed, setIsItemsAllowed] = React.useState(false);
    const [isOrbAllowed, setIsOrbAllowed] = React.useState(false);

    // Reset load state when changing rooms
    React.useEffect(() => {
        setIsSplatLoaded(false);
        setIsItemsAllowed(false);
        setIsOrbAllowed(false);
    }, [experienceId]);

    // Listen for production events from ExperiencePage
    React.useEffect(() => {
        const handleItemsAllowed = () => {
            console.log('[Scene3D] msc-items-allowed received - showing icons');
            setIsItemsAllowed(true);
        };
        const handleOrbAllowed = () => {
            console.log('[Scene3D] msc-orb-allowed received - showing coin');
            setIsOrbAllowed(true);
        };
        window.addEventListener('msc-items-allowed', handleItemsAllowed);
        window.addEventListener('msc-orb-allowed', handleOrbAllowed);
        return () => {
            window.removeEventListener('msc-items-allowed', handleItemsAllowed);
            window.removeEventListener('msc-orb-allowed', handleOrbAllowed);
        };
    }, [experienceId]);


    const gelatoTexture = useTexture('/textures/gelato.png');
    const gaudiTexture = useTexture('/textures/Gaudi/casa_mila.png');

    // Listen for wine glass reveal and confetti
    React.useEffect(() => {
        const playPing = () => {
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High A
                osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1); // Slide down

                gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start();
                osc.stop(audioCtx.currentTime + 0.3);
            } catch (e) {
                console.warn("Audio ping failed:", e);
            }
        };

        const handleShowWine = () => {
            console.log("[Scene3D] Wine glass revealed!");
            setShowWineGlass(true);
        };
        const handleShowGelato = () => {
            console.log("[Scene3D] Gelato revealed!");
            setShowGelato(true);
        };
        const handleConfetti = () => {
            console.log("[Scene3D] Triggering CONFETTI burst!");
            playPing();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // Auto-cleanup
        };
        window.addEventListener('show-wine-glass', handleShowWine);
        window.addEventListener('show-gelato', handleShowGelato);
        window.addEventListener('trigger-confetti', handleConfetti);
        return () => {
            window.removeEventListener('show-wine-glass', handleShowWine);
            window.removeEventListener('show-gelato', handleShowGelato);
            window.removeEventListener('trigger-confetti', handleConfetti);
        };
    }, []);

    const { backpack, challenges, getTotalCoins } = useGame();
    const isBellCollected = backpack.some(item => item.id === `activity-${experienceId}`) || challenges[`exp-${experienceId}`]?.objectsFound > 0;
    const isCoinCollected = challenges[`exp-${experienceId}`]?.coinFound;

    // Debug: Trace why objects disappear
    React.useEffect(() => {
        const inBackpack = backpack.some(item => item.id === `activity-${experienceId}`);
        const challengeFound = challenges[`exp-${experienceId}`]?.objectsFound > 0;
        console.log(`%c[Exp ${experienceId} Debug]`, 'color: orange; font-weight: bold;');
        console.log(`  isBellCollected: ${isBellCollected}`);
        console.log(`  -> inBackpack: ${inBackpack}`);
        console.log(`  -> challengeFound: ${challengeFound}`);
        console.log(`  GymBall collected: ${backpack.some(item => item.id === 'GymBall')}`);
    }, [backpack, challenges, experienceId, isBellCollected]);

    // Clear local dirty state when room changes to avoid cross-room state leaks
    React.useEffect(() => {
        setLocalPositions({});
        setLocalRotations({});
        console.log(`[Scene3D] Resetting local transforms for Room: ${experienceId}`);
    }, [experienceId]);

    const startPos = React.useMemo(() => config.startPos || [0, 2, 5], [config.startPos]);
    const startRot = React.useMemo(() => config.startRot || [0, 0, 0], [config.startRot]);
    
    // Standardize positions: use roomConfig's "coin" and "items" if they exist, else static fallbacks
    const coinRefObj = roomConfig.coin || roomConfig.items?.find(item => item.type === 'medal' || item.type === 'coin') || {};
    const coinPos = coinRefObj.position || roomConfig.coin?.position || config.coinPos || [2, 1.5, -2];
    
    // Select activity and coin objects from the influencer items array
    const activityRefObj = roomConfig.items?.find(item => 
        item.type === 'bell' || item.type === 'activity' || item.id === '1-1' || item.id === `${experienceId}-1`
    ) || roomConfig.items?.[0] || {};
    const activityPos = activityRefObj.position || config.activityPos || [-2, 0.5, 0];
    
    const coinSize = (config.coinSize || 0.4) * 0.65;
    const activitySize = (config.activitySize || 0.3) * 0.65;
    const modelScale = config.scale || 1;
    const activityRot = toRad(roomConfig.items?.[0]?.rotation) || config.activityRot || [0, 0, 0];
    const boundaries = config.boundaries || [];

    // Feature: Scene Matching Lighting
    const lightColor = config.lightColor || '#ffffff';
    const shadowOpacity = config.shadowOpacity || 0.5;

    const coinRef = useRef();
    const chestRef = useRef();

    usePlayerControls(startPos, startRot, boundaries);



    const handleCoinClick = (e) => {
        e.stopPropagation();
        const event = new CustomEvent('object-clicked', { detail: { name: 'Coin', experienceId } });
        window.dispatchEvent(event);
        if (coinRef.current) coinRef.current.visible = false;
    };

    const handleActivityClick = (e) => {
        e.stopPropagation();
        const event = new CustomEvent('object-clicked', { detail: { name: 'ActivityObject', experienceId } });
        window.dispatchEvent(event);
    };

    useManualRaycaster(coinRef, chestRef, handleCoinClick, handleActivityClick);

    const [localPositions, setLocalPositions] = React.useState({});
    const [localRotations, setLocalRotations] = React.useState({});
    const [editorMode, setEditorMode] = React.useState('translate');

    const currentCoinPos = localPositions['coin'] || coinPos;
    const currentActivityPos = localPositions['activity'] || activityPos;
    const currentRemotePos = localPositions['remote'] || config.remotePos;
    const currentRemoteRot = localRotations['remote'] || config.remoteRot || [0, 0, 0];


    // Helper to get rotation in DEGREES for the UI
    const getDegrees = (id, fallback = [0, 0, 0]) => {
        const rads = localRotations[id] || fallback;
        return rads.map(r => r * (180 / Math.PI));
    };

    // Debug logging for collected state
    React.useEffect(() => {
        console.log(`[Scene3D] Exp ${experienceId} State:`, { isCoinCollected, isBellCollected, backpackIds: backpack.map(i => i.id) });
    }, [experienceId, isCoinCollected, isBellCollected, backpack]);

    // Notify parent about current objects and their positions
    React.useEffect(() => {
        const reportObjects = () => {
            const objs = [];

            // Add starting camera position (standardized for overall room experience)
            objs.push({
                id: 'camera',
                name: 'Initial Camera Position',
                pos: (localPositions['camera'] || startPos),
                rot: getDegrees('camera', startRot)
            });

            objs.push({
                id: 'coin',
                name: 'MSC Cruises Coin',
                pos: [currentCoinPos[0], currentCoinPos[1], currentCoinPos[2]],
                rot: getDegrees('coin', config.coinRot)
            });
            objs.push({
                id: 'activity',
                name: 'Main Activity',
                pos: [currentActivityPos[0], currentActivityPos[1], currentActivityPos[2]],
                rot: getDegrees('activity', activityRot)
            });
            if (experienceId === '1' && config.remotePos) objs.push({
                id: 'remote',
                name: 'TV Remote',
                pos: [currentRemotePos[0], currentRemotePos[1], currentRemotePos[2]],
                rot: getDegrees('remote', config.remoteRot)
            });
            if ((experienceId === '3' || experienceId === '4') && config.menuPos) objs.push({
                id: 'menu',
                name: 'Restaurant Menu',
                pos: (localPositions['menu'] || config.menuPos),
                rot: getDegrees('menu', config.menuRot)
            });
            if (showWineGlass && config.winePos) objs.push({
                id: 'wine',
                name: 'Wine Glass',
                pos: (localPositions['wine'] || config.winePos),
                rot: getDegrees('wine', config.wineRot)
            });
            if (showGelato && config.rewardPos) objs.push({
                id: 'reward',
                name: 'Reward Item',
                pos: (localPositions['reward'] || config.rewardPos),
                rot: getDegrees('reward', config.rewardRot)
            });
            if (experienceId === '5' && config.gaudiPos) objs.push({
                id: 'gaudi',
                name: 'Gaudi Panel',
                pos: (localPositions['gaudi'] || config.gaudiPos),
                rot: getDegrees('gaudi', config.gaudiRot)
            });

            config.extraObjects?.forEach((obj, index) => {
                const id = `extra-${index}`;
                objs.push({
                    id,
                    name: obj.name || `Extra ${index}`,
                    pos: (localPositions[id] || obj.pos),
                    rot: getDegrees(id, obj.rot)
                });
            });

            // Method 1: Global State (Polling)
            window.sceneEditorObjects = objs;

            // Method 2: Custom Event (Legacy/Push)
            window.dispatchEvent(new CustomEvent('scene-editor-update', { detail: { objects: objs } }));

            console.log("[Scene3D] Updated Scene Editor Data:", objs.length, "items");
        };

        const handleRequest = () => reportObjects();
        const handleManualSync = (e) => {
            if (e.detail && e.detail.id) {
                if (e.detail.pos) {
                    console.log("[Scene3D] Manual POS sync received:", e.detail.id, e.detail.pos);
                    setLocalPositions(prev => ({ ...prev, [e.detail.id]: e.detail.pos }));
                }
                if (e.detail.rot) {
                    console.log("[Scene3D] Manual ROT sync received:", e.detail.id, e.detail.rot);
                    // Convert degrees from UI to radians for 3D
                    const rads = e.detail.rot.map(d => d * (Math.PI / 180));
                    setLocalRotations(prev => ({ ...prev, [e.detail.id]: rads }));
                }
            }
        };
        const handleModeChange = (e) => {
            if (e.detail && e.detail.mode) {
                setEditorMode(e.detail.mode);
            }
        };

        const handleUseCameraPos = (e) => {
            const { id } = e.detail;
            if (!id) return;

            // Use the global latestCameraPos updated by usePlayerControls
            const pos = window.latestCameraPos;
            const rot = window.latestCameraRot;

            if (!pos) {
                console.error("[Scene3D] Failed to capture camera position: window.latestCameraPos is undefined");
                return;
            }

            console.log(`[Scene3D] Snapping object ${id} to camera view:`, pos);
            
            setLocalPositions(prev => ({ ...prev, [id]: [...pos] }));
            setLocalRotations(prev => ({ ...prev, [id]: [...(rot || [0, 0, 0])] }));
            
            // For camera ID, we also need to manually trigger the player controls update so the view stays synced
            if (id === 'camera') {
                window.dispatchEvent(new CustomEvent('camera-manual-update', { 
                    detail: { pos, rot } 
                }));
            }
        };

        window.addEventListener('scene-editor-request-sync', handleRequest);
        window.addEventListener('scene-editor-manual-update', handleManualSync);
        window.addEventListener('scene-editor-mode-change', handleModeChange);
        window.addEventListener('scene-editor-use-camera-pos', handleUseCameraPos);
        reportObjects();

        return () => {
            window.removeEventListener('scene-editor-request-sync', handleRequest);
            window.removeEventListener('scene-editor-manual-update', handleManualSync);
            window.removeEventListener('scene-editor-mode-change', handleModeChange);
            window.removeEventListener('scene-editor-use-camera-pos', handleUseCameraPos);
        };
    }, [localPositions, localRotations, experienceId, coinPos, activityPos, config.avatarPos, config.remotePos, config.extraObjects, config.menuPos, config.winePos, config.rewardPos, config.gaudiPos, showWineGlass, showGelato, currentCoinPos, currentActivityPos, currentRemotePos, activityRot]);

    const handleTransform = (id, e) => {
        if (!e.target.object) return;
        const obj = e.target.object;
        if (editorMode === 'translate') {
            const { x, y, z } = obj.position;
            setLocalPositions(prev => ({ ...prev, [id]: [x, y, z] }));
        } else {
            const { x, y, z } = obj.rotation;
            setLocalRotations(prev => ({ ...prev, [id]: [x, y, z] }));
        }
    };

    const isEditorActive = isEditorMode;
    console.log("[Scene3D] Editor State:", { isEditorActive, activeEditorObject });

    const lightingIntensity = config.lightingIntensity || 0.8;

    return (
        <>
            <ambientLight intensity={lightingIntensity * 0.5} color={lightColor} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color={lightColor} />

            {/* 1. RENDER SPLAT MAP */}
            <DynamicModel config={config} modelScale={modelScale} onSplatLoad={() => {
                setIsSplatLoaded(true);
                window.dispatchEvent(new CustomEvent('msc-splat-loaded'));
                // Ensure camera snaps to the truth startPos/Rot once splat is ready
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('force-camera-reset'));
                }, 100); 
            }} />

            {/* Loading indicator handled by ExperienceCanvas Suspense fallback */}

            {/* 2. ONLY SHOW INTERACTIVE ELEMENTS ONCE SPLAT IS LOADED */}
            {isSplatLoaded && (
                <>
                    {/* Scene Confetti Effect */}
                    {showConfetti && <Confetti particleCount={150} position={[0, 4, -2]} fallSpeed={3} spread={4} />}

                    <group>
                        {console.log(`[Scene3D] Rendering Coin for Exp ${experienceId}:`, { pos: currentCoinPos, isCollected: isCoinCollected, isOrbAllowed })}
                        <TransformWrapper id="coin" activeId={activeEditorObject} isEditorActive={isEditorActive} handleTransform={handleTransform} mode={editorMode}>
                            {/* Production: coin only appears after icon interaction (msc-orb-allowed event) */}
                            {isOrbAllowed && (
                                <group ref={coinRef}>
                                    <Suspense fallback={null}>
                                        <TexturedCoin
                                            pos={currentCoinPos}
                                            size={coinSize}
                                            texturePath={coinRefObj.media || config.coinMedia || '/textures/coin.png'}
                                            onClick={handleCoinClick}
                                            isCollected={isCoinCollected}
                                        />
                                    </Suspense>
                                </group>
                            )}
                        </TransformWrapper>
                    </group>


                    {/* GLOBAL BACKPACK MARKERS: Only show first 2 items from roomConfig */}
                    {isItemsAllowed && roomConfig.items?.slice(0, 2).map((item, idx) => {
                        const id = item.id;
                        const isFirstItem = idx === 0;
                        const markerId = isFirstItem ? 'remote' : 'activity'; // For editor sync
                        const pos = localPositions[markerId] || item.position;
                        const isItemCollected = itemsViewed.includes(id);

                        return (
                            <group key={id}>
                                <TransformWrapper id={markerId} activeId={activeEditorObject} isEditorActive={isEditorActive} handleTransform={handleTransform} mode={editorMode}>
                                    <group>
                                        <BackpackMarker
                                            pos={pos}
                                            experienceId={experienceId}
                                            size={isFirstItem ? 0.5 : 0.4}
                                            isCollected={isItemCollected}
                                            onClick={() => window.dispatchEvent(new CustomEvent('object-clicked', { detail: { name: isFirstItem ? 'TVControl' : 'ActivityObject', experienceId } }))}
                                        />
                                    </group>
                                </TransformWrapper>
                            </group>
                        );
                    })}

                    {/* TelephoneBox removal confirmed by user - we only need the backpack items and final coin in Room 5 now */}

                    {
                        (experienceId === '3' || experienceId === '4') && config.menuPos && (
                            <group>
                                <TransformWrapper id="menu" activeId={activeEditorObject} isEditorActive={isEditorActive} handleTransform={handleTransform} mode={editorMode}>
                                    <InteractiveMenu
                                        pos={localPositions['menu'] || config.menuPos}
                                        rotation={localRotations['menu'] || config.menuRot || [0, 0, 0]}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.dispatchEvent(new CustomEvent('object-clicked', { detail: { name: 'RestaurantMenu', experienceId } }));
                                        }}
                                    />
                                </TransformWrapper>
                            </group>
                        )
                    }

                    {
                        showWineGlass && config.winePos && (
                            <group>
                                <TransformWrapper id="wine" activeId={activeEditorObject} isEditorActive={isEditorActive} handleTransform={handleTransform} mode={editorMode}>
                                    <ProceduralWineGlass
                                        pos={localPositions['wine'] || config.winePos}
                                        rotation={localRotations['wine'] || config.wineRot || [0, 0, 0]}
                                    />
                                </TransformWrapper>
                            </group>
                        )
                    }

                    {
                        showGelato && config.rewardPos && isItemsAllowed && (
                            <group>
                                <TransformWrapper id="reward" activeId={activeEditorObject} isEditorActive={isEditorActive} handleTransform={handleTransform} mode={editorMode}>
                                    <ProceduralGelato
                                        pos={localPositions['reward'] || config.rewardPos}
                                        rotation={localRotations['reward'] || config.rewardRot || [0, 0, 0]}
                                    />
                                </TransformWrapper>
                            </group>
                        )
                    }

                    {/* Gaudi billboard merged into activity object */}

                    {/* TelephoneBox removal confirmed by user - we only need the backpack items and final coin in Room 5 now */}

                    {/* Fallback to default render removed to eliminate ghost meshes */}
                </>
            )}
        </>
    );
};

// Avatar preload removed to prevent flash before isStarted=true

export default Scene3D;
