import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { LumaSplatsThree } from '@lumaai/luma-web';

const LumaModel = ({ source, scale = 1, rotation = [0, 0, 0], position = [0, 0, 0], onLoad }) => {
    const { scene, gl } = useThree();
    const splatsRef = useRef();
    const firedRef = useRef(false);

    useEffect(() => {
        // Initialize Luma Splats
        const splats = new LumaSplatsThree({
            source: source,
            enableThreeShaderIntegration: true,
            particleRevealEnabled: true,
        });

        // Apply transforms
        splats.scale.set(scale, scale, scale);
        splats.rotation.set(...rotation);
        splats.position.set(...position);

        // Add to scene
        scene.add(splats);
        splatsRef.current = splats;

        // Trigger onLoad if provided
        if (onLoad && !firedRef.current) {
            firedRef.current = true;
            // Luma doesn't have a simple "ready" event, so we'll wait a brief moment
            setTimeout(onLoad, 500);
        }

        return () => {
            // Cleanup
            if (splatsRef.current) {
                scene.remove(splatsRef.current);
                splatsRef.current.dispose();
            }
        };
    }, [source, scene, scale, rotation, position, onLoad]);

    useFrame(() => {
        // Optional: Update logic if Luma needs per-frame updates (usually handled internally by the Three adaptor)
    });

    return null; // LumaSplatsThree manages its own mesh
};

export default LumaModel;
