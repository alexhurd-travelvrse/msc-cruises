import React, { Suspense, useMemo } from 'react';
import { Canvas, useThree, extend } from '@react-three/fiber';
import { useTexture, Html, useProgress, Environment } from '@react-three/drei';
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
useTexture.preload('/textures/msc_sovereign_coin.png');


const ExperienceCanvas = React.memo(({ 
    experienceId, 
    isInteractionActive, 
    isEditorMode, 
    activeEditorObject, 
    isStarted = false, 
    isItemsAllowed = false, 
    isOrbAllowed = false, 
    itemsViewed = [] 
}) => {
    return (
        <Canvas
            id="canvas-container"
            style={{ width: '100%', height: '100vh', background: '#050510' }}
            camera={{ position: [0, 2, 5], fov: 75 }}
            dpr={0.75} // Reduced from 1 to save GPU memory
            gl={{
                antialias: false,
                alpha: false,
                depth: true,
                stencil: false,
                powerPreference: 'high-performance',
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat: false,
                logarithmicDepthBuffer: false,
                precision: 'mediump'
            }}
            onCreated={({ gl }) => {
                const canvas = gl.domElement;

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
            <SparkSystem />
            <Suspense fallback={null}>
                {/* Simplified environment for specific heavy rooms */}
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
                />
            </Suspense>
        </Canvas>
    );
});

export default ExperienceCanvas;
