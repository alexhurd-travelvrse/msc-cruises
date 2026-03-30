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

function Loader() {
    const { progress } = useProgress();
    if (progress >= 100) return null;

    return (
        <Html center style={{ pointerEvents: 'none' }}>
            <div style={{
                color: '#FFD700',
                background: 'rgba(5, 5, 16, 0.9)',
                padding: '30px 50px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                textAlign: 'center',
                minWidth: '280px',
                fontFamily: 'Inter, sans-serif',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '4px', marginBottom: '15px', color: '#888', textTransform: 'uppercase' }}>
                    Initializing Room
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '10px' }}>
                    {progress.toFixed(0)}%
                </div>
                <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#FFD700', transition: 'width 0.4s ease-out' }} />
                </div>
            </div>
        </Html>
    );
}

// Preload common interactive textures to prevent suspension
useTexture.preload('/textures/coin.png');
useTexture.preload('/textures/activity.png');
useTexture.preload('/textures/gelato.png');


const ExperienceCanvas = React.memo(({ experienceId, isInteractionActive, isEditorMode, activeEditorObject, isStarted = false }) => {
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
            <Suspense fallback={<Loader />}>
                <Scene3D
                    key={experienceId}
                    experienceId={experienceId}
                    isInteractionActive={isInteractionActive}
                    isEditorMode={isEditorMode}
                    activeEditorObject={activeEditorObject}
                    isStarted={isStarted}
                />
            </Suspense>
        </Canvas>
    );
});

export default ExperienceCanvas;
