import React, { useRef, useEffect, useState } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { SplatMesh } from '@sparkjsdev/spark';

// Register for R3F
extend({ SplatMesh, 'splatMesh': SplatMesh });

/**
 * SparkModel renders a single splat environment.
 * We use the 'key' prop to force a complete re-mount when the URL changes.
 */
const SparkModel = ({ url, scale = 1, rotation = [0, 0, 0], position = [0, 0, 0], onLoad }) => {
    const isMounted = useRef(true);
    const meshRef = useRef();
    const [isEngineReady, setIsEngineReady] = useState(SplatMesh.isStaticInitialized);

    const onLoadRef = useRef(onLoad);
    useEffect(() => { onLoadRef.current = onLoad; }, [onLoad]);

    const firedRef = useRef(false);
    const frameCountRef = useRef(0);
    const isDataLoadedRef = useRef(false);

    useEffect(() => {
        if (!isEngineReady) {
            SplatMesh.staticInitialized.then(() => {
                if (isMounted.current) {
                    console.log('%c[Spark.js] WASM Engine Ready', 'color: #00ff00; font-weight: bold;');
                    setIsEngineReady(true);
                }
            });
        }
    }, [isEngineReady]);

    useEffect(() => {
        isMounted.current = true;
        firedRef.current = false;
        frameCountRef.current = 0;
        isDataLoadedRef.current = false;
        console.log(`%c[Spark.js] Loading Splat: ${url}`, 'color: #00e5ff; font-weight: bold;');

        return () => {
            isMounted.current = false;
            if (meshRef.current) {
                console.log(`%c[Spark.js] Disposing Splat: ${url}`, 'color: #ff6600; font-weight: bold;');
                const mesh = meshRef.current;
                
                if (mesh.packedSplats && typeof mesh.packedSplats.dispose === 'function') {
                    try { mesh.packedSplats.dispose(); } catch (e) {}
                    mesh.packedSplats = null;
                }

                try { if (mesh.dispose) mesh.dispose(); } catch (e) {}
                if (mesh.geometry) { try { mesh.geometry.dispose(); } catch (e) {} }
                if (mesh.material) {
                    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    materials.forEach(mat => {
                        Object.keys(mat).forEach(key => {
                            const val = mat[key];
                            if (val && typeof val.dispose === 'function') { try { val.dispose(); } catch (e) {} }
                        });
                        try { mat.dispose(); } catch (e) {}
                    });
                }
                if (mesh.parent) { try { mesh.parent.remove(mesh); } catch (e) {} }
                meshRef.current = null;
            }
        };
    }, [url]);

    useFrame(() => {
        if (firedRef.current || !isMounted.current || !onLoadRef.current) return;
        
        const mesh = meshRef.current;
        if (!mesh || !mesh.packedSplats || mesh.packedSplats.numSplats === 0) {
            frameCountRef.current = 0;
            return;
        }

        if (!isDataLoadedRef.current) {
            isDataLoadedRef.current = true;
            console.log(`%c[Spark.js] Network Data Loaded: ${url}`, 'color: #ff00ff; font-weight: bold;');
        }

        frameCountRef.current++;
        if (frameCountRef.current >= 3) { // Reduced for faster signal response
            firedRef.current = true;
            console.log(`%c[Spark.js] ✓ Scene Materialized: ${url}`, 'color: #00ff00; font-weight: bold;');
            onLoadRef.current();
        }
    });

    if (!url || !isEngineReady) return null;

    return (
        <splatMesh
            ref={meshRef}
            key={url}
            args={[{ url }]}
            position={position}
            rotation={rotation}
            scale={[scale, scale, scale]}
            renderOrder={-1}
            toneMapped={false}
            raycast={() => null}
        />
    );
};

export default SparkModel;

