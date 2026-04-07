import React, { useEffect, useRef } from 'react';
import { useInfluencer } from '../context/InfluencerContext';
import { useVoice } from '../context/VoiceContext';

// Delay (ms) after `active` becomes true before voiceover plays.
const AUDIO_DELAY_MS = 2000;
const FADE_IN_MS = 80;

const fadeIn = (audio) => {
    audio.volume = 0;
    const step = 1 / (FADE_IN_MS / 16);
    const interval = setInterval(() => {
        audio.volume = Math.min(1, audio.volume + step);
        if (audio.volume >= 1) clearInterval(interval);
    }, 16);
};

const AudioController = ({ audioKey, active, script }) => {
    const { publicConfig } = useInfluencer();
    const { startAnalysis, stopAnalysis, initAudioContext, playedKeysRef } = useVoice();
    const currentKeyRef = useRef(audioKey);
    const hasPlayedRef = useRef(false);
    const didSuccessfullyPlayRef = useRef(false);
    const hasSentSpeakRef = useRef(false);
    const hasSentPlayRef = useRef(false);
    const gestureTriggerRef = useRef(false);
    const triggerFuncRef = useRef(null);
    const setupGestureTriggerRef = useRef(null);
    const audioInstanceRef = useRef(null);
    const configRef = useRef(publicConfig);
    const isMountedRef = useRef(true);

    configRef.current = publicConfig;

    useEffect(() => {
        isMountedRef.current = true;
        initAudioContext();
        return () => { isMountedRef.current = false; };
    }, []);

    const stopAll = () => {
        if (audioInstanceRef.current) {
            audioInstanceRef.current.pause();
            audioInstanceRef.current = null;
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        stopAnalysis();
    };

    const removeGestureListeners = () => {
        if (triggerFuncRef.current) {
            window.removeEventListener('mousedown', triggerFuncRef.current);
            window.removeEventListener('click', triggerFuncRef.current);
            window.removeEventListener('touchstart', triggerFuncRef.current);
            window.removeEventListener('keydown', triggerFuncRef.current);
            triggerFuncRef.current = null;
            gestureTriggerRef.current = false;
        }
    };

    const playAudio = (url, isBlob = false) => {
        const audio = new Audio(url);
        audio.crossOrigin = 'anonymous';
        audioInstanceRef.current = audio;
        audio.volume = 0;

        audio.play()
            .then(() => {
                didSuccessfullyPlayRef.current = true;
                playedKeysRef.current.add(audioKey);
                removeGestureListeners();
                fadeIn(audio);
                startAnalysis(audio);
            })
            .catch(e => {
                console.error(`Error playing audio for ${audioKey}:`, e);
                hasSentPlayRef.current = false;
                if (e.name === 'NotAllowedError' || e.name === 'NotSupportedError') {
                    if (setupGestureTriggerRef.current) setupGestureTriggerRef.current();
                }
            });
    
        audio.onended = () => {
            if (isBlob) URL.revokeObjectURL(url);
            stopAll();
        };
    };

    useEffect(() => {
        if (!active) {
            stopAll();
            return;
        }

        if (playedKeysRef.current.has(audioKey)) return;

        if (currentKeyRef.current !== audioKey) {
            hasPlayedRef.current = false;
            didSuccessfullyPlayRef.current = false;
            hasSentSpeakRef.current = false;
            hasSentPlayRef.current = false;
            currentKeyRef.current = audioKey;
            stopAll();
            removeGestureListeners();
        }

        if (hasPlayedRef.current) return;

        const executeAudio = () => {
            const cfg = configRef.current;
            const recordedAudio = cfg?.audioFiles?.[audioKey];
            const voiceScript = cfg?.audio?.[audioKey] || script;

            if (recordedAudio) {
                const playWithBlob = async () => {
                    if (hasSentPlayRef.current || !isMountedRef.current) return;
                    hasSentPlayRef.current = true;
                    try {
                        const response = await fetch(recordedAudio);
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        playAudio(blobUrl, true);
                    } catch (e) {
                        hasSentPlayRef.current = false;
                        playAudio(recordedAudio, false);
                    }
                };
                if (audioKey === 'home' || audioKey === 'teleport') playWithBlob();
                else playAudio(recordedAudio, false);
            } else if (voiceScript && window.speechSynthesis) {
                const startSpeak = () => {
                    if (hasSentSpeakRef.current || !isMountedRef.current) return;
                    hasSentSpeakRef.current = true;
                    try {
                        window.speechSynthesis.cancel();
                        const voices = window.speechSynthesis.getVoices();
                        if (voices.length === 0) { hasSentSpeakRef.current = false; return; }

                        const utterance = new SpeechSynthesisUtterance(voiceScript);
                        const preferredVoice = voices.find(v => v.name.includes('Alex')) || voices[0];
                        if (preferredVoice) utterance.voice = preferredVoice;
                        utterance.onstart = () => {
                            didSuccessfullyPlayRef.current = true;
                            playedKeysRef.current.add(audioKey);
                            removeGestureListeners();
                            startAnalysis({ pause: () => window.speechSynthesis.cancel(), onended: null });
                        };
                        utterance.onend = () => stopAnalysis();
                        utterance.onerror = () => { if (setupGestureTriggerRef.current) setupGestureTriggerRef.current(); };
                        window.speechSynthesis.speak(utterance);
                    } catch (e) { console.error(e); }
                };
                if (window.speechSynthesis.getVoices().length === 0) {
                    window.speechSynthesis.addEventListener('voiceschanged', startSpeak, { once: true });
                } else {
                    startSpeak();
                }
            }
        };

        const setupGestureTrigger = () => {
            if (gestureTriggerRef.current) return;
            gestureTriggerRef.current = true;
            const triggerOnGesture = () => {
                if (didSuccessfullyPlayRef.current || (window.speechSynthesis && window.speechSynthesis.speaking)) {
                    removeGestureListeners();
                    return;
                }
                executeAudio();
                removeGestureListeners();
            };
            triggerFuncRef.current = triggerOnGesture;
            window.addEventListener('mousedown', triggerOnGesture, { once: true });
            window.addEventListener('click', triggerOnGesture, { once: true });
            window.addEventListener('touchstart', triggerOnGesture, { once: true });
            window.addEventListener('keydown', triggerOnGesture, { once: true });
        };

        setupGestureTriggerRef.current = setupGestureTrigger;

        const playVoice = () => {
            if (hasPlayedRef.current) return;
            const cfg = configRef.current;
            if (!cfg?.audioFiles?.[audioKey] && !cfg?.audio?.[audioKey] && !script) return;
            hasPlayedRef.current = true;
            stopAll();
            executeAudio();
            if (audioKey === 'home') setupGestureTrigger();
        };

        const delay = audioKey === 'home' ? 0 : AUDIO_DELAY_MS;
        const timer = setTimeout(playVoice, delay);

        return () => {
            clearTimeout(timer);
            stopAll();
            removeGestureListeners();
        };
    }, [audioKey, active, script]);

    // Implement "One Audio Asset" Rule
    useEffect(() => {
        const handleSensoryActive = (e) => {
            const isSensoryActive = e.detail.active;
            
            // If sensory audio starts, pause/mute main narrator
            if (isSensoryActive) {
                if (audioInstanceRef.current) {
                    audioInstanceRef.current.volume = 0;
                    audioInstanceRef.current.pause();
                }
                if (window.speechSynthesis) window.speechSynthesis.pause();
                console.log("[AudioController] 🔉 Sensory audio prioritized. Narration paused.");
            } else {
                // If sensory audio stops, resume main narrator if it was active
                if (audioInstanceRef.current && active) {
                    audioInstanceRef.current.play().catch(e => console.log("Narration resume blocked:", e));
                    fadeIn(audioInstanceRef.current);
                }
                if (window.speechSynthesis) window.speechSynthesis.resume();
                console.log("[AudioController] 🔉 Narration resumed.");
            }
        };

        window.addEventListener('msc-sensory-audio-active', handleSensoryActive);
        return () => window.removeEventListener('msc-sensory-audio-active', handleSensoryActive);
    }, [active]);

    return null;
};

export default AudioController;
