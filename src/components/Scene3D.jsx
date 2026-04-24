import React, { useRef, Suspense } from 'react';
import { Environment, useTexture, Billboard, Text, Float, TransformControls, useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerControls } from '../hooks/usePlayerControls';
import { useManualRaycaster } from '../hooks/useManualRaycaster';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';

import SparkModel from './SparkModel';
import LumaModel from './LumaModel';
import Confetti from './Confetti';
import BackpackMarker from './BackpackMarker';

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

const DynamicModel = ({ config, modelScale, onSplatLoad }) => {
    const path = config.splatUrl || "/models/1.splat";
    const modelRotation = React.useMemo(() => config.modelRotation || [0, 0, 0], [config.modelRotation]);

    console.log('%c[DynamicModel] Rendering with path:', 'color: #ff00ff; font-weight: bold;', path);

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
        console.error('[DynamicModel] Error rendering model:', error);
        return null;
    }
};

const Scene3D = ({ 
    experienceId, 
    isInteractionActive, 
    isEditorMode, 
    activeEditorObject, 
    isStarted = false, 
    isItemsAllowed: isItemsAllowedProp = false,
    isOrbAllowed: isOrbAllowedProp = false,
    itemsViewed = [],
    isModalOpen = false
}) => {
    const { publicConfig } = useInfluencer();
    const { backpack, challenges, getTotalCoins } = useGame();
    
    const roomConfig = publicConfig?.experiences?.[experienceId] || {};
    
    // Standardize: Convert degrees from roomConfig (truth) to radians for 3D engine
    const toRad = (arr) => arr ? arr.map(d => d * (Math.PI / 180)) : arr;
    
    // Create a normalized config where all rotations are radians
    const config = React.useMemo(() => {
        const merged = { ...roomConfig };
        
        // Ensure defaults for critical fields
        merged.startPos = roomConfig.startPos || [0, 2, 5];
        merged.startRot = toRad(roomConfig.startRot || [0, 0, 0]);
        merged.splatUrl = roomConfig.splatUrl || "/models/1.splat";
        
        if (roomConfig.coin?.rotation) merged.coinRotation = toRad(roomConfig.coin.rotation);
        
        return merged;
    }, [roomConfig]);

    const [showConfetti, setShowConfetti] = React.useState(false);
    const [isSplatLoaded, setIsSplatLoaded] = React.useState(false);
    
    const isItemsAllowed = isItemsAllowedProp;
    const isOrbAllowed = isOrbAllowedProp;

    // Reset load state when changing rooms
    React.useEffect(() => {
        setIsSplatLoaded(false);
    }, [experienceId]);

    // Listen for confetti
    React.useEffect(() => {
        const handleConfetti = () => {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); 
        };
        window.addEventListener('trigger-confetti', handleConfetti);
        return () => window.removeEventListener('trigger-confetti', handleConfetti);
    }, []);

    const startPos = React.useMemo(() => config.startPos || [0, 2, 5], [config.startPos]);
    const startRot = React.useMemo(() => config.startRot || [0, 0, 0], [config.startRot]);
    const boundaries = config.boundaries || [];

    usePlayerControls(startPos, startRot, boundaries);

    const [localPositions, setLocalPositions] = React.useState({});
    const [localRotations, setLocalRotations] = React.useState({});
    const [editorMode, setEditorMode] = React.useState('translate');

    // Handle Editor Events
    React.useEffect(() => {
        const handleManualUpdate = (e) => {
            const { id, pos, rot } = e.detail;
            if (pos) setLocalPositions(prev => ({ ...prev, [id]: pos }));
            if (rot) setLocalRotations(prev => ({ ...prev, [id]: rot.map(v => v * (Math.PI / 180)) }));
        };
        const handleModeChange = (e) => setEditorMode(e.detail.mode);
        
        const handleUseCameraPos = (e) => {
            const { id } = e.detail;
            
            if (window.latestCameraPos) {
                const p = [...window.latestCameraPos];
                const r = window.latestCameraRot ? window.latestCameraRot.map(v => v * (180/Math.PI)) : [0,0,0];

                // For icons, we might want to push them forward, but for camera itself, we just capture
                if (id === 'camera') {
                     window.dispatchEvent(new CustomEvent('scene-editor-manual-sync', { detail: { id, pos: p, rot: r } }));
                } else {
                    setLocalPositions(prev => ({ ...prev, [id]: p }));
                    window.dispatchEvent(new CustomEvent('scene-editor-manual-sync', { detail: { id, pos: p } }));
                }
            }
        };

        window.addEventListener('scene-editor-manual-update', handleManualUpdate);
        window.addEventListener('scene-editor-mode-change', handleModeChange);
        window.addEventListener('scene-editor-use-camera-pos', handleUseCameraPos);
        return () => {
            window.removeEventListener('scene-editor-manual-update', handleManualUpdate);
            window.removeEventListener('scene-editor-mode-change', handleModeChange);
            window.removeEventListener('scene-editor-use-camera-pos', handleUseCameraPos);
        };
    }, []);

    const handleTransform = (id, e) => {
        const obj = e.target.object;
        if (editorMode === 'translate') {
            const p = [obj.position.x, obj.position.y, obj.position.z];
            setLocalPositions(prev => ({ ...prev, [id]: p }));
            window.dispatchEvent(new CustomEvent('scene-editor-manual-sync', { detail: { id, pos: p } }));
        } else if (editorMode === 'rotate') {
            const r = [obj.rotation.x, obj.rotation.y, obj.rotation.z];
            setLocalRotations(prev => ({ ...prev, [id]: r }));
            const degs = r.map(v => v * (180/Math.PI));
            window.dispatchEvent(new CustomEvent('scene-editor-manual-sync', { detail: { id, rot: degs } }));
        }
    };

    return (
        <group>
            <ambientLight intensity={1.0} />
            <hemisphereLight intensity={2.0} />
            
            <DynamicModel 
                config={config} 
                modelScale={config.scale || 1} 
                onSplatLoad={() => {
                    setIsSplatLoaded(true);
                    window.dispatchEvent(new CustomEvent('msc-splat-loaded'));
                }} 
            />

            {isItemsAllowed && (roomConfig.backpack_icons || roomConfig.items)?.map((item, idx) => {
                const isCollected = backpack.some(b => b.id === item.id);
                // Support both whitelabel coordinates and legacy position array
                const rawPos = item.coordinates ? [item.coordinates.x, item.coordinates.y, item.coordinates.z] : item.position;
                
                return (
                    <TransformWrapper 
                        key={item.id} 
                        id={item.id} 
                        activeId={activeEditorObject} 
                        isEditorActive={isEditorMode} 
                        handleTransform={handleTransform}
                        mode={editorMode}
                    >
                        <BackpackMarker 
                            id={item.id}
                            experienceId={experienceId}
                            pos={localPositions[item.id] || rawPos}
                            size={0.4}
                            isCollected={isCollected}
                            type={item.type}
                            isStarted={isStarted}
                            isModalOpen={isModalOpen}
                            discoveryMode={item.discoveryMode || 'instant'}
                            audioUrl={item.collectible?.type === 'mp3' ? item.collectible.url : null}
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('object-clicked', { 
                                    detail: { 
                                        name: 'ActivityObject', 
                                        experienceId,
                                        itemIndex: idx
                                    } 
                                }));
                            }}
                        />
                    </TransformWrapper>
                );
            })}

            {showConfetti && <Confetti />}
        </group>
    );
};

export default Scene3D;
