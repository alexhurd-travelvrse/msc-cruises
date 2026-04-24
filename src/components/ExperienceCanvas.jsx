import React, { Suspense, useMemo } from 'react';
import { Canvas, useThree, extend } from '@react-three/fiber';
import { useTexture, Html, useProgress, Environment, PerspectiveCamera } from '@react-three/drei';
import { SparkRenderer as SparkRendererCore, SplatMesh } from '@sparkjsdev/spark';
import Scene3D from './Scene3D';

// Register Spark components with R3F
extend({ SparkRendererCore, splatMesh: SplatMesh });

// Internal component for setup
const SparkSystem = () => {
    const { gl } = useThree();
    const options = useMemo(() => ({
        renderer: gl,
        autoUpdate: true
    }), [gl]);

    console.log('%c[SparkSystem] Initializing Spark.js renderer', 'color: #00e5ff; font-weight: bold;');

    return <sparkRendererCore args={[options]} />;
};



// Preload common interactive textures to prevent suspension
useTexture.preload('/textures/coin.png');
useTexture.preload('/textures/activity.png');
useTexture.preload('/textures/gelato.png');
// Removed legacy preloads


const ExperienceCanvas = React.memo(({ 
    experienceId, 
    isInteractionActive, 
    isEditorMode, 
    activeEditorObject, 
    isStarted = false, 
    isItemsAllowed = false, 
    isOrbAllowed = false, 
    itemsViewed = [],
    isModalOpen = false 
}) => {
    return (
        <Canvas
            id="canvas-container"
            style={{ 
                width: '100%', 
                height: '100vh', 
                background: '#050510',
                filter: 'brightness(1.3) contrast(1.08) saturate(1.05)' // Sharpened contrast for clarity
            }}
            dpr={0.75} // Matches proven performance profile from MSC master
            gl={{
                antialias: false, 
                alpha: false,
                depth: true,
                stencil: false, 
                powerPreference: 'high-performance',
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat: false,
                logarithmicDepthBuffer: false,
                precision: 'highp'
            }}
            onCreated={({ gl }) => {
                const canvas = gl.domElement;
                canvas.id = 'webgl-canvas';
                // Force Marble-spec color management at the engine level
                gl.outputColorSpace = 'srgb'; 
                gl.toneMapping = 4; // ACESFilmic
                gl.toneMappingExposure = 1.2; 
                // Cap Max Texture Size to prevent mobile crashes
                const maxTexSize = gl.capabilities.maxTextureSize;
                console.log(`[Canvas] GPU Info: Max Texture Size: ${maxTexSize}`);
                // Ensure we don't use textures larger than 4096 even if GPU supports it
                // (This is a soft cap, actual resize needs to happen in texture loader, 
                // but this logs limits for debugging)

                canvas.addEventListener('webglcontextlost', (event) => {
                    event.preventDefault();
                    console.error('%c[Canvas] WebGL Context Lost! GPU crashed.', 'color: #ff0000; font-weight: bold;');
                    // Removed automatic reload to prevent infinite loops in restricted environments
                }, false);

                canvas.addEventListener('webglcontextrestored', () => {
                    console.log('%c[Canvas] WebGL Context Restored.', 'color: #00ff00; font-weight: bold;');
                }, false);
            }}
        >
            <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={75} near={0.2} far={200} />
            <SparkSystem />
            <Suspense fallback={null}>
                {(experienceId === '2' || experienceId === '3') ? (
                    <Environment preset="night" />
                ) : (
                    <Environment preset="city" />
                )}
            </Suspense>
            <Suspense fallback={null}>
                <Scene3D
                    key={experienceId}
                    experienceId={experienceId}
                    isInteractionActive={isInteractionActive}
                    isEditorMode={isEditorMode}
                    activeEditorObject={activeEditorObject}
                    isStarted={isStarted}
                    isItemsAllowed={isItemsAllowed}
                    isOrbAllowed={isOrbAllowed}
                    itemsViewed={itemsViewed}
                    isModalOpen={isModalOpen}
                />
            </Suspense>
        </Canvas>
    );
});

export default ExperienceCanvas;
