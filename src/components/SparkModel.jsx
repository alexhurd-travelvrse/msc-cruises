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
    const firedRef = useRef(false);
    const frameCountRef = useRef(0);

    const onLoadRef = useRef(onLoad);
    useEffect(() => { onLoadRef.current = onLoad; }, [onLoad]);

    useEffect(() => {
        isMounted.current = true;
        firedRef.current = false;
        frameCountRef.current = 0;
        
        // Resolve URL to absolute to ensure library handles it correctly
        const absoluteUrl = new URL(url, window.location.origin).href;
        console.log(`%c[Spark.js] 🌐 Loading Splat: ${absoluteUrl}`, 'color: #00e5ff; font-weight: bold;');
        console.log(`%c[Spark.js] 📍 Origin: ${window.location.origin}`, 'color: #888;');

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
                meshRef.current = null;
            }
        };
    }, [url]);

    useFrame(() => {
        if (firedRef.current || !isMounted.current || !onLoadRef.current) return;
        
        const mesh = meshRef.current;
        if (!mesh) return;

        // In Spark 0.1.10, we'll wait for the mesh to be present and then give it a small buffer
        // to ensure the GPU buffers are initialized.
        frameCountRef.current++;
        if (frameCountRef.current >= 30) { // Approx 0.5s at 60fps
            firedRef.current = true;
            console.log(`%c[Spark.js] ✓ Scene Ready: ${url}`, 'color: #00ff00; font-weight: bold;');
            onLoadRef.current();
        }
    });

    if (!url) return null;

    const resolvedUrl = new URL(url, window.location.origin).href;
    
    return (
        <splatMesh
            ref={meshRef}
            key={resolvedUrl}
            args={[{ url: resolvedUrl }]}
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

