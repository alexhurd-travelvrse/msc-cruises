import React, { useState, useRef, useEffect } from 'react';

const VoiceRecorder = ({ onSave, initialAudio, guideText }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(initialAudio || null);
    const [isPlaying, setIsPlaying] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);

    useEffect(() => {
        if (initialAudio) {
            setAudioUrl(initialAudio);
        }
    }, [initialAudio]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    setAudioUrl(base64data);
                    onSave(base64data);
                };
                reader.readAsDataURL(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            const tracks = mediaRecorderRef.current.stream.getTracks();
            tracks.forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const playAudio = () => {
        if (audioUrl) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => setIsPlaying(false);
            audio.play();
        }
    };

    const deleteAudio = () => {
        setAudioUrl(null);
        onSave(null);
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            marginTop: '10px', 
            padding: '15px', 
            background: 'rgba(0,0,0,0.03)', 
            borderRadius: '12px',
            border: '1px dashed #ccc'
        }}>
            {guideText && (
                <div style={{ 
                    width: '100%', 
                    padding: '10px 15px', 
                    background: 'white', 
                    borderRadius: '8px', 
                    borderLeft: '4px solid #007bff',
                    fontSize: '0.9rem',
                    color: '#444',
                    fontStyle: 'italic',
                    lineHeight: '1.5',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <strong style={{ color: '#007bff', marginRight: '8px' }}>Guide:</strong> "{guideText}"
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                {!isRecording ? (
                    <button 
                        onClick={startRecording}
                        style={{ 
                            padding: '10px 20px', 
                            background: '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '30px', 
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 10px rgba(220, 53, 69, 0.3)'
                        }}
                    >
                        <span style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%', display: 'inline-block' }}></span>
                        RECORD VOICE
                    </button>
                ) : (
                    <button 
                        onClick={stopRecording}
                        style={{ 
                            padding: '10px 20px', 
                            background: '#333', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '30px', 
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            animation: 'pulse 1.5s infinite',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        ⏹️ STOP RECORDING
                    </button>
                )}

                {audioUrl && !isRecording && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button 
                            onClick={playAudio}
                            style={{ 
                                padding: '10px 20px', 
                                background: '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '30px', 
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {isPlaying ? '🔈 PLAYING...' : '▶️ PLAY PREVIEW'}
                        </button>
                        <button 
                            onClick={deleteAudio}
                            style={{ 
                                padding: '10px 15px', 
                                background: 'transparent', 
                                color: '#dc3545', 
                                border: '1px solid #dc3545', 
                                borderRadius: '30px', 
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            DELETE
                        </button>
                    </div>
                )}

                {!audioUrl && !isRecording && (
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>No recording found.</span>
                )}
            </div>

            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.6; }
                        100% { opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

export default VoiceRecorder;
