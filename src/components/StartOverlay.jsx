import React from 'react';

const StartOverlay = ({ onStart, title, subtitle, isVisible }) => {
    // Use CSS opacity instead of unmounting so the overlay fades out without
    // causing a layout repaint at the exact moment the staggered timers begin.
    return (
        <div
            className="overlay-container"
            style={{
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? 'auto' : 'none',
                transition: 'opacity 0.3s ease-out',
            }}
        >
            <div className="overlay-content animate-fade-in">
                <h1 className="overlay-title">
                    {title || "VIRTUAL RESORT EXPERIENCE"}
                </h1>
                <p className="overlay-subtitle">
                    {subtitle || "Ready to explore?"}
                </p>

                {/* VISUAL NAVIGATION GUIDE */}
                <div className="key-guide">
                    <div>
                        <div className="key-group-title">MOVE</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div className="key-box">W</div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <div className="key-box">A</div>
                                <div className="key-box">S</div>
                                <div className="key-box">D</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="key-group-title">ELEVATION</div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <div className="key-box">Q <span style={{ fontSize: '0.6rem', display: 'block' }}>DOWN</span></div>
                            <div className="key-box">E <span style={{ fontSize: '0.6rem', display: 'block' }}>UP</span></div>
                        </div>
                    </div>
                    <div>
                        <div className="key-group-title">VISUALS</div>
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🖱️</div>
                            <div style={{ fontSize: '0.7rem' }}>CLICK + DRAG<br />TO LOOK</div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.currentTarget.disabled = true;
                        e.currentTarget.innerText = "ENTERING EXPERIENCE...";
                        onStart();
                    }}
                    className="btn-primary btn-large"
                >
                    START CHALLENGE
                </button>

                <p style={{ marginTop: '30px', fontSize: '0.8rem', color: '#555', fontStyle: 'italic' }}>
                    Collecting All 5 Medals to Complete the Challenge
                </p>
            </div>
        </div>
    );
};

export default StartOverlay;
