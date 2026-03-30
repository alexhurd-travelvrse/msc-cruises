import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
const THREE = window.THREE || { MathUtils: { lerp: (a, b, t) => a + (b - a) * t } };

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
    // Completely removed React state to prevent re-renders when audio starts.
    // All audio reactivity is now driven via mutable refs read directly inside useFrame.
    const volumeRef = useRef(0);
    const isSpeakingRef = useRef(false);
    const playedKeysRef = useRef(new Set());
    
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationFrameRef = useRef(null);

    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const startAnalysis = (audioElement) => {
        initAudioContext();
        
        try {
            // Only create a source if the target is a real HTMLMediaElement
            if (audioElement instanceof HTMLMediaElement) {
                const source = audioContextRef.current.createMediaElementSource(audioElement);
                source.connect(analyserRef.current);
                analyserRef.current.connect(audioContextRef.current.destination);
                
                const updateVolume = () => {
                    if (!analyserRef.current) return;
                    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
                    
                    // Calculate RMS
                    let sum = 0;
                    for (let i = 0; i < dataArrayRef.current.length; i++) {
                        const val = (dataArrayRef.current[i] - 128) / 128;
                        sum += val * val;
                    }
                    const rms = Math.sqrt(sum / dataArrayRef.current.length);
                    
                    // Smooth the volume
                    volumeRef.current = THREE.MathUtils.lerp(volumeRef.current, rms, 0.2);
                    
                    animationFrameRef.current = requestAnimationFrame(updateVolume);
                };
                
                updateVolume();
            } else {
                console.log("[VoiceContext] Non-element source provided (starting simulated pulse)");
                // Start a periodic pulse for non-media sources (like SpeechSynthesis)
                const pulse = () => {
                    if (!isSpeakingRef.current) return;
                    volumeRef.current = 0.05 + Math.random() * 0.18;
                    animationFrameRef.current = requestAnimationFrame(pulse);
                };
                pulse();
            }
            
            isSpeakingRef.current = true;
        } catch (e) {
            console.warn("[VoiceContext] Audio source already connected or error:", e);
        }
    };

    const stopAnalysis = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        isSpeakingRef.current = false;
        volumeRef.current = 0;
    };

    // Resume AudioContext on user gesture to satisfy browser policy
    useEffect(() => {
        const handleGesture = () => {
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            window.removeEventListener('click', handleGesture);
            window.removeEventListener('touchstart', handleGesture);
            window.removeEventListener('keydown', handleGesture);
        };
        window.addEventListener('click', handleGesture);
        window.addEventListener('touchstart', handleGesture);
        window.addEventListener('keydown', handleGesture);
        return () => {
            window.removeEventListener('click', handleGesture);
            window.removeEventListener('touchstart', handleGesture);
            window.removeEventListener('keydown', handleGesture);
        };
    }, []);

    // Static context value - NEVER causes consumer re-renders
    const contextValue = useRef({
        volumeRef,
        isSpeakingRef,
        playedKeysRef,
        startAnalysis,
        stopAnalysis,
        initAudioContext
    }).current;

    return (
        <VoiceContext.Provider value={contextValue}>
            {children}
        </VoiceContext.Provider>
    );
};

export const useVoice = () => useContext(VoiceContext);

// Mock THREE if not available for lerp
