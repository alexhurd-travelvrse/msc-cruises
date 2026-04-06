import React from 'react';

function CoordinateAxisInput({ axis, i, selectedObj, transformMode }) {
    const isRot = transformMode === 'rotate';
    const currentVal = isRot ? (selectedObj.rot?.[i] || 0) : selectedObj.pos?.[i];
    
    // We use a local state for the input text so user can type decimals like "0."
    const [inputValue, setInputValue] = React.useState(currentVal?.toFixed(isRot ? 1 : 3) || '0');
    const isFocused = React.useRef(false);

    // Sync from props only when NOT focused
    React.useLayoutEffect(() => {
        if (!isFocused.current && currentVal !== undefined) {
            setInputValue(currentVal.toFixed(isRot ? 1 : 3));
        }
    }, [currentVal, isRot]);

    return (
        <div key={axis}>
            <label style={{ fontSize: '0.65rem', color: '#888', display: 'block', marginBottom: '4px' }}>
                {axis.toUpperCase()}{isRot ? '°' : ''}
            </label>
            <input
                type="text"
                value={inputValue}
                onFocus={() => { isFocused.current = true; }}
                onBlur={() => { isFocused.current = false; }}
                onChange={(e) => {
                    const raw = e.target.value;
                    setInputValue(raw);
                    
                    const newVal = parseFloat(raw);
                    if (!isNaN(newVal)) {
                        const field = isRot ? 'rot' : 'pos';
                        const currentArr = isRot ? (selectedObj.rot || [0, 0, 0]) : (selectedObj.pos || [0, 0, 0]);
                        const newArr = [...currentArr];
                        newArr[i] = newVal;
                        
                        // Use specialized event for camera to move the actual 3D view
                        if (selectedObj.id === 'camera') {
                            window.dispatchEvent(new CustomEvent('camera-manual-update', {
                                detail: { [field]: newArr }
                            }));
                        } else {
                            window.dispatchEvent(new CustomEvent('scene-editor-manual-update', {
                                detail: { id: selectedObj.id, [field]: newArr }
                            }));
                        }
                    }
                }}
                style={{
                    width: '100%',
                    background: 'rgba(255, 215, 0, 0.05)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    color: '#FFD700',
                    padding: '10px 8px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                    textAlign: 'center'
                }}
            />
        </div>
    );
}

function SceneEditor({
    activeObject,
    setActiveObject,
    objects = [],
    isEditorMode,
    setIsEditorMode,
    onExport,
    onSaveToContext,
    onDownloadConfig,
    onResetToTruth
}) {
    const [copied, setCopied] = React.useState(false);
    const [localSaved, setLocalSaved] = React.useState(false);
    const [publishSaved, setPublishSaved] = React.useState(false);
    const [saveError, setSaveError] = React.useState(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [transformMode, setTransformMode] = React.useState('translate'); // 'translate' | 'rotate'


    if (!isEditorMode) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('force-camera-reset'))}
                    style={{
                        padding: '10px 20px',
                        background: 'rgba(255, 215, 0, 0.1)',
                        color: '#FFD700',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        borderRadius: '2px', // Leica Hard Edge
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontWeight: '400',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        backdropFilter: 'blur(10px)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        fontFamily: 'Outfit, sans-serif'
                    }}
                >
                    🎯 RECENTER
                </button>
                {window.location.search.includes('editor=true') && (
                    <button
                        onClick={() => setIsEditorMode(true)}
                        style={{
                            padding: '12px 24px',
                            background: 'rgba(0, 0, 0, 0.85)',
                            color: '#FFD700',
                            border: '1px solid #FFD700',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s ease',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        ⚙️ OPEN EDITOR
                    </button>
                )}
            </div>
        );
    }


    const handleCopy = () => {
        if(onExport) onExport();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLocalSave = async () => {
        try {
            setSaveError(null);
            if (onSaveToContext) {
                const result = await onSaveToContext(objects);
                if (result && result.success) {
                    setLocalSaved(true);
                    setTimeout(() => setLocalSaved(false), 3000);
                } else {
                    setSaveError('Failed to save to Influencer Context');
                }
            }
        } catch (error) {
            console.error('Local save error:', error);
            setSaveError(error.message);
        }
    };

    const handlePublishToDisk = async () => {
        try {
            setSaveError(null);
            
            // This specifically hits the Node.js backend to update config_truth.json
            const experienceId = window.location.pathname.split('/').pop() || '1';
            const activeCompanyId = import.meta.env.VITE_ACTIVE_COMPANY || 'msc-cruises';
            
            const response = await fetch('/api/save-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: activeCompanyId,
                    experienceId,
                    objects: objects.map(obj => ({
                        id: obj.id,
                        pos: obj.pos,
                        rot: obj.rot,
                        discoveryMode: obj.discoveryMode
                    }))
                })
            });
            const result = await response.json();
            if (response.ok) {
                setPublishSaved(true);
                setTimeout(() => setPublishSaved(false), 3000);
                alert("🚀 READY FOR GITHUB DESKTOP!\nYour coordinates have been written to config_truth.json.");
            } else {
                setSaveError(result.error || 'Failed to save to project files');
            }
        } catch (error) {
            console.error('Publish error:', error);
            setSaveError(error.message);
        }
    };

    // Communicate mode change to 3D Scene
    const updateMode = (mode) => {
        setTransformMode(mode);
        window.dispatchEvent(new CustomEvent('scene-editor-mode-change', { detail: { mode } }));
    };

    const isCamera = activeObject === 'camera';
    const selectedItem = (objects || []).find(o => o.id === activeObject);

    const selectedObj = isCamera ? {
        id: 'camera',
        name: 'Camera Start Position',
        pos: (window.latestCameraPos || [0, 0, 0]),
        rot: (window.latestCameraRot || [0, 0, 0])
    } : selectedItem;

    return (
        <div 
            onPointerDown={e => e.stopPropagation()}
            onPointerMove={e => e.stopPropagation()}
            onPointerUp={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                width: '320px',
                background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.98), rgba(5, 5, 20, 0.98))',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                borderRadius: '16px',
                padding: '24px',
                color: 'white',
                zIndex: 10000,
                fontFamily: 'Outfit, Inter, sans-serif',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                animation: 'slideUp 0.3s ease-out'
            }}
        >
            <style>
                {`
                    @keyframes slideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .editor-item:hover { background: rgba(255, 215, 0, 0.1) !important; color: #FFD700 !important; }
                    .tab-btn { flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: #fff; cursor: pointer; font-size: 0.75rem; letter-spacing: 1px; transition: 0.2s; }
                    .tab-btn.active { background: #FFD700; color: #000; font-weight: bold; border-color: #FFD700; }
                    .tab-btn:first-child { border-radius: 8px 0 0 8px; }
                    .tab-btn:last-child { border-radius: 0 8px 8px 0; }
                `}
            </style>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#FFD700', fontSize: '1rem', letterSpacing: '1px', fontWeight: '800' }}>
                    SCENE EDITOR
                </h3>
                <button
                    onClick={() => setIsEditorMode(false)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#ff4444', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    ✕
                </button>
            </div>

            {/* Main Selection Dropdown */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '0.7rem', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Select Activity to Change
                </label>
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        padding: '12px',
                        background: 'rgba(255, 215, 0, 0.05)',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        borderRadius: '8px',
                        color: activeObject ? '#FFD700' : '#888',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                    }}
                >
                    <span>
                        {activeObject === 'camera' ? '🎥 Camera Start Position' : 
                         (objects.find(o => o.id === activeObject)?.name || 'Choose target...')}
                    </span>
                    <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>▾</span>
                </div>

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '120px',
                        left: '24px',
                        right: '24px',
                        background: '#1a1a2e',
                        border: '1px solid rgba(255,215,0,0.3)',
                        borderRadius: '8px',
                        zIndex: 10001,
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                    }}>
                        <div 
                            className="editor-item"
                            onClick={() => { setActiveObject('camera'); setIsOpen(false); }}
                            style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.2s', color: activeObject === 'camera' ? '#FFD700' : 'white' }}
                        >
                            🎥 Camera Start Position
                        </div>
                        {objects.map((obj, i) => (
                            <div 
                                key={obj.id}
                                className="editor-item"
                                onClick={() => { setActiveObject(obj.id); setIsOpen(false); }}
                                style={{ 
                                    padding: '12px', 
                                    cursor: 'pointer', 
                                    borderBottom: i === objects.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', 
                                    transition: '0.2s',
                                    color: activeObject === obj.id ? '#FFD700' : 'white'
                                }}
                            >
                                {obj.id.startsWith('special-') ? '🪙 Golden Medal (Coin)' : `🎒 ${obj.name}`}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Snap To View Action */}
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => {
                        const camPos = window.latestCameraPos;
                        if (!camPos) return;

                        if (activeObject) {
                            // Use the global event that handles camera forward alignment
                            // This event gives control to Scene3D which has access to the real Three.js camera
                            window.dispatchEvent(new CustomEvent('scene-editor-use-camera-pos', {
                                 detail: { id: activeObject }
                            }));
                            
                            const objName = isCamera ? 'Camera Position' : (objects.find(o => o.id === activeObject)?.name || activeObject);
                            alert(`📍 Position Captured for ${objName}! Look around to verify or click SAVE TO PRODUCTION to apply permanently.`);
                        }
                    }}
                    disabled={!activeObject}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: activeObject ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${activeObject ? '#00E676' : '#444'}`,
                        color: activeObject ? '#00E676' : '#666',
                        borderRadius: '8px',
                        fontWeight: '900',
                        cursor: activeObject ? 'pointer' : 'not-allowed',
                        letterSpacing: '1px',
                        fontSize: '0.8rem'
                    }}
                >
                    📍 PLACE AT CURRENT VIEW
                </button>
            </div>

            {selectedObj && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <button className={`tab-btn ${transformMode === 'translate' ? 'active' : ''}`} onClick={() => updateMode('translate')}>MOVE</button>
                        <button className={`tab-btn ${transformMode === 'rotate' ? 'active' : ''}`} onClick={() => updateMode('rotate')}>ROTATE</button>
                    </div>

                    <div style={{ fontSize: '0.8rem', marginBottom: '12px', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{transformMode.toUpperCase()} ({selectedObj.name})</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {['x', 'y', 'z'].map((axis, i) => (
                            <CoordinateAxisInput 
                                key={`${selectedObj.id}-${axis}-${transformMode}`}
                                axis={axis}
                                i={i}
                                selectedObj={selectedObj}
                                transformMode={transformMode}
                            />
                        ))}
                    </div>

                    {selectedObj.id !== 'camera' && selectedObj.id !== 'coin' && !selectedObj.id.startsWith('extra-') && (
                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <label style={{ fontSize: '0.7rem', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Discovery Mode (Lead Magnet)
                            </label>
                            <select 
                                value={selectedObj.discoveryMode || 'instant'}
                                onChange={(e) => {
                                    window.dispatchEvent(new CustomEvent('scene-editor-manual-update', {
                                        detail: { id: selectedObj.id, discoveryMode: e.target.value }
                                    }));
                                }}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    background: 'rgba(0,0,0,0.5)', 
                                    color: '#00e5ff', 
                                    border: '1px solid rgba(0,229,255,0.3)', 
                                    borderRadius: '6px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="instant">Instant (Passive Interest)</option>
                                <option value="scan">Scan / Magnifying Glass (High Intent)</option>
                                <option value="sonic">Sonic Proximity (Sensory Lead)</option>
                            </select>
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '8px', fontSize: '0.75rem', textAlign: 'center', marginBottom: '5px' }}>
                    🎥 <b>CURRENT CAMERA VIEW</b> WILL BE SAVED
                </div>
                
                <button
                    onClick={handleLocalSave}
                    style={{
                        padding: '16px',
                        background: localSaved ? '#00c853' : 'rgba(255, 215, 0, 0.1)',
                        color: localSaved ? 'white' : '#FFD700',
                        border: '1px solid #FFD700',
                        borderRadius: '12px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '0.85rem',
                        transition: '0.3s'
                    }}
                >
                    {localSaved ? '✓ LOCAL CONFIG SAVED' : '💾 SAVE CONFIGURATION (LOCAL)'}
                </button>

                <button
                    onClick={handlePublishToDisk}
                    style={{
                        padding: '16px',
                        background: publishSaved ? '#7000FF' : 'linear-gradient(to right, #7000FF, #00e5ff)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 8px 25px rgba(0, 229, 255, 0.4)',
                        transition: 'all 0.3s',
                        fontSize: '0.85rem'
                    }}
                >
                    {publishSaved ? '✓ READY FOR GITHUB' : '🚀 PUBLISH CHANGES (FOR GITHUB DESKTOP)'}
                </button>

                {saveError && (
                    <div style={{
                        padding: '10px',
                        background: 'rgba(244, 67, 54, 0.1)',
                        border: '1px solid #F44336',
                        borderRadius: '6px',
                        color: '#F44336',
                        fontSize: '0.75rem',
                        textAlign: 'center'
                    }}>
                        ⚠️ {saveError}
                    </div>
                )}
            </div>

            <p style={{ fontSize: '0.7rem', marginTop: '20px', color: '#666', textAlign: 'center', lineHeight: '1.4' }}>
                Use <b>Save Configuration</b> to preview locally. Use <b>Publish Changes</b> to update the source code for your next GitHub Push.
            </p>
        </div>
    );
}

export default SceneEditor;
