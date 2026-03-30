import React, { useState, useEffect } from 'react';
import { useInfluencer } from '../../context/InfluencerContext';
import VoiceRecorder from '../../components/VoiceRecorder';

const ConfigDashboard = () => {
    const { currentInfluencer, currentDestination, activeCompanyId, companies, getConfig, saveConfig, earnings, updateInfluencer, influencers } = useInfluencer();
    const [formData, setFormData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const activeCompany = companies.find(c => c.id === (activeCompanyId || currentDestination));
    const isReadOnly = activeCompany?.status === 'dumb';

    useEffect(() => {
        const companyId = activeCompanyId || currentDestination;
        if ((currentInfluencer || currentDestination) && companyId) {
            const config = getConfig(currentInfluencer?.id, companyId);
            setFormData(config);
        }
    }, [currentInfluencer, currentDestination, activeCompanyId, getConfig]);

    const handleChange = (section, field, value, subField = null) => {
        if (isReadOnly) return;
        setFormData(prev => {
            if (section === 'audioFiles') {
                return {
                    ...prev,
                    audioFiles: {
                        ...prev.audioFiles,
                        [field]: value
                    }
                };
            }
            if (subField) {
                // Handle nested updates like coins[key][subField] or personas[key][subField]
                const sectionData = { ...prev[section] };
                sectionData[field] = { ...sectionData[field], [subField]: value };
                return { ...prev, [section]: sectionData };
            }
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            };
        });
    };

    const handleSave = async () => {
        if (isReadOnly) return;
        setIsSaving(true);
        const companyId = activeCompanyId || currentDestination;

        // Dev-only sync to local filesystem for persistence across builds/deployments
        if (import.meta.env.DEV) {
            console.log("[ConfigDashboard] Dev mode: Syncing audio to filesystem...");
            const audioEntries = Object.entries(formData.audioFiles || {});
            for (const [key, data] of audioEntries) {
                if (data && data.startsWith('data:audio')) {
                    try {
                        const response = await fetch('/api/save-audio', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ companyId, audioKey: key, audioData: data })
                        });
                        const result = await response.json();
                        if (result.success) {
                            console.log(`[ConfigDashboard] Synced ${key} to ${result.path}`);
                            // Replace base64 with the newly created public path
                            formData.audioFiles[key] = result.path;
                        }
                    } catch (e) {
                        console.error(`[ConfigDashboard] Sync failed for ${key}:`, e);
                    }
                }
            }

            // ALSO: Sync the core JSON config (text, transcripts, weights)
            console.log("[ConfigDashboard] Syncing core JSON truth...");
            try {
                await fetch('/api/save-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ companyId, config: formData })
                });
                console.log("[ConfigDashboard] ✓ Master Truth JSON updated locally.");
            } catch (e) { console.warn("[ConfigDashboard] Global JSON sync failed."); }
        }

        saveConfig(currentInfluencer?.id, companyId, formData);
        alert("✓ Published! Changes synced to production files.");
        setIsSaving(false);
    };

    if (!formData) return <div>Loading...</div>;

    const currentEarnings = (currentInfluencer && earnings[currentInfluencer.id]) || 0;

    const audioSections = [
        { id: 'home', label: 'Home Page Intro' },
        { id: 'teleport', label: 'Teleport Page / Map' },
        { id: '1', label: 'Experience 1: Luxury Room' },
        { id: '2', label: 'Experience 2: The Spa' },
        { id: '3', label: 'Experience 3: Tacos Restaurant' },
        { id: '4', label: 'Experience 4: Kids Activities' },
        { id: '5', label: 'Experience 5: Excursion' },
        { id: 'completion', label: 'Completion / Final Offer' },
        { id: 'default', label: 'Default Fallback' }
    ];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#333' }}>Configuration</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        Editing: <strong>{activeCompany?.name}</strong> {isReadOnly && <span style={{ color: 'red' }}>(Read Only)</span>}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Earnings</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>${currentEarnings}</div>
                </div>
            </div>

            {/* Home Page Configuration */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Home Page</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Hero Title</label>
                    <input
                        type="text"
                        value={formData?.home?.title || ''}
                        onChange={(e) => handleChange('home', 'title', e.target.value)}
                        disabled={isReadOnly}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Hero Subtitle</label>
                    <input
                        type="text"
                        value={formData?.home?.subtitle || ''}
                        onChange={(e) => handleChange('home', 'subtitle', e.target.value)}
                        disabled={isReadOnly}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Hero Description</label>
                    <textarea
                        value={formData?.home?.description || ''}
                        onChange={(e) => handleChange('home', 'description', e.target.value)}
                        disabled={isReadOnly}
                        rows={3}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Influencer Photo URL</label>
                    <input
                        type="text"
                        value={formData.home.influencerPhoto || ''}
                        onChange={(e) => handleChange('home', 'influencerPhoto', e.target.value)}
                        placeholder="Leave blank to use default avatar"
                        disabled={isReadOnly}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    {formData.home.influencerPhoto && (
                        <div style={{ marginTop: '0.5rem', height: '80px', width: '80px', overflow: 'hidden', borderRadius: '50%' }}>
                            <img src={formData.home.influencerPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                </div>
            </div>

            {/* Teleport Page Configuration */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Teleport Page</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Intro Text</label>
                    <textarea
                        value={formData.teleport.introText || ''}
                        onChange={(e) => handleChange('teleport', 'introText', e.target.value)}
                        disabled={isReadOnly}
                        rows={3}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
            </div>
            {/* Audio Configuration */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Experience Voice Recordings</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
                    Record the influencer voiceover for each experience. Recordings play automatically after the scene loads.
                </p>

                {audioSections.map((section) => (
                    <div key={section.id} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', color: '#333' }}>
                            {section.label}
                        </label>
                        {!isReadOnly && (
                        <VoiceRecorder 
                            initialAudio={formData.audioFiles?.[section.id]} 
                            guideText={formData.audio?.[section.id]}
                            onSave={(audioData) => handleChange('audioFiles', section.id, audioData)} 
                        />
                        )}
                    </div>
                ))}
            </div>

            {/* Coin Clues Configuration */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Speakeasy Coin Clues</h3>

                {formData.coins && Object.keys(formData.coins).map((key) => (
                    <div key={key} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
                        <h4 style={{ marginTop: 0 }}>{key === '5' ? 'Final Puzzle (Exp 5)' : `Experience ${key} Coin`}</h4>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
                            <input
                                type="text"
                                value={formData.coins[key].title}
                                onChange={(e) => handleChange('coins', key, e.target.value, 'title')}
                                disabled={isReadOnly}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Clue Text / Description</label>
                            <textarea
                                value={formData.coins[key].text}
                                onChange={(e) => handleChange('coins', key, e.target.value, 'text')}
                                disabled={isReadOnly}
                                rows={2}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Image URL</label>
                            <input
                                type="text"
                                value={formData.coins[key].image}
                                onChange={(e) => handleChange('coins', key, e.target.value, 'image')}
                                disabled={isReadOnly}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Experience Items Configuration */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Experience Items (Backpack Content)</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
                    Configure the interactive items hidden throughout each experience.
                </p>

                {Object.keys(formData.experiences).map((expId) => (
                    <div key={expId} style={{ marginBottom: '2.5rem', padding: '1.5rem', border: '1px solid #eef', borderRadius: '8px', background: '#fcfcff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ margin: 0, color: '#0056b3' }}>Experience {expId}</h4>
                            <a href={`/experience/${expId}?editor=true`} target="_blank" rel="noopener noreferrer" style={{
                                padding: '6px 12px', background: '#e83e8c', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold'
                            }}>
                                📐 Open 3D Editor
                            </a>
                        </div>
                        
                        {(formData.experiences[expId].items || []).map((item, itemIdx) => (
                            <div key={item.id} style={{ marginBottom: '2rem', padding: '1rem', border: '1px dotted #ccc', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h5 style={{ margin: 0 }}>Item {itemIdx + 1}: {item.name}</h5>
                                    <span style={{ fontSize: '0.7rem', color: '#999' }}>ID: {item.id}</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Name</label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => {
                                                const newItems = [...formData.experiences[expId].items];
                                                newItems[itemIdx] = { ...newItems[itemIdx], name: e.target.value };
                                                handleChange('experiences', expId, { ...formData.experiences[expId], items: newItems });
                                            }}
                                            disabled={isReadOnly}
                                            style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Preview Image URL</label>
                                        <input
                                            type="text"
                                            value={item.media}
                                            onChange={(e) => {
                                                const newItems = [...formData.experiences[expId].items];
                                                newItems[itemIdx] = { ...newItems[itemIdx], media: e.target.value };
                                                handleChange('experiences', expId, { ...formData.experiences[expId], items: newItems });
                                            }}
                                            disabled={isReadOnly}
                                            style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Description</label>
                                    <textarea
                                        value={item.text}
                                        onChange={(e) => {
                                            const newItems = [...formData.experiences[expId].items];
                                            newItems[itemIdx] = { ...newItems[itemIdx], text: e.target.value };
                                            handleChange('experiences', expId, { ...formData.experiences[expId], items: newItems });
                                        }}
                                        disabled={isReadOnly}
                                        rows={2}
                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: '#007bff', fontWeight: 'bold' }}>Vertical Video URL (TikTok/Instagram style)</label>
                                    <input
                                        type="text"
                                        value={item.video || ''}
                                        onChange={(e) => {
                                            const newItems = [...formData.experiences[expId].items];
                                            newItems[itemIdx] = { ...newItems[itemIdx], video: e.target.value };
                                            handleChange('experiences', expId, { ...formData.experiences[expId], items: newItems });
                                        }}
                                        placeholder="https://example.com/video.mp4"
                                        disabled={isReadOnly}
                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '2px solid #007bff' }}
                                    />
                                    <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>Video will play automatically on interaction.</p>
                                </div>

                                <div style={{ 
                                    marginTop: '1.5rem', 
                                    padding: '1rem', 
                                    background: 'rgba(0, 123, 255, 0.05)', 
                                    borderRadius: '8px',
                                    border: '1px solid rgba(0, 123, 255, 0.2)'
                                }}>
                                    <h6 style={{ margin: '0 0 1rem 0', color: '#0056b3' }}>🎁 Digital Collectible (Takeaway)</h6>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem' }}>Asset Type</label>
                                            <select
                                                value={item.collectible?.type || ''}
                                                onChange={(e) => {
                                                    const newItems = [...formData.experiences[expId].items];
                                                    newItems[itemIdx] = { 
                                                        ...newItems[itemIdx], 
                                                        collectible: { ...(newItems[itemIdx].collectible || {}), type: e.target.value }
                                                    };
                                                    handleChange('experiences', expId, { ...formData.experiences[expId], items: newItems });
                                                }}
                                                disabled={isReadOnly}
                                                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                            >
                                                <option value="">None</option>
                                                <option value="image">Image (Gallery Photo)</option>
                                                <option value="mp3">Audio (MP3 Mix)</option>
                                                <option value="pdf">Document (PDF Tip Sheet)</option>
                                                <option value="badge">3D Trophy (GLB Badge)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem' }}>Collectible Title</label>
                                            <input
                                                type="text"
                                                value={item.collectible?.title || ''}
                                                onChange={(e) => {
                                                    const newItems = [...formData.experiences[expId].items];
                                                    newItems[itemIdx] = { 
                                                        ...newItems[itemIdx], 
                                                        collectible: { ...(newItems[itemIdx].collectible || {}), title: e.target.value }
                                                    };
                                                    handleChange('experiences', expId, { ...formData.experiences[expId], items: newItems });
                                                }}
                                                placeholder="e.g. Exclusive Sunset Shot"
                                                disabled={isReadOnly}
                                                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem' }}>Collectible Asset URL</label>
                                        <input
                                            type="text"
                                            value={item.collectible?.url || ''}
                                            onChange={(e) => {
                                                const newItems = [...formData.experiences[expId].items];
                                                newItems[itemIdx] = { 
                                                    ...newItems[itemIdx], 
                                                    collectible: { ...(newItems[itemIdx].collectible || {}), url: e.target.value }
                                                };
                                                handleChange('experiences', expId, { ...formData.experiences[expId], items: newItems });
                                            }}
                                            placeholder="https://example.com/asset.jpg"
                                            disabled={isReadOnly}
                                            style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '0' }}>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem' }}>Collectible Description</label>
                                        <textarea
                                            value={item.collectible?.description || ''}
                                            onChange={(e) => {
                                                const newItems = [...formData.experiences[expId].items];
                                                newItems[itemIdx] = { 
                                                    ...newItems[itemIdx], 
                                                    collectible: { ...(newItems[itemIdx].collectible || {}), description: e.target.value }
                                                };
                                                handleChange('experiences', expId, { ...formData.experiences[expId], items: newItems });
                                            }}
                                            rows={2}
                                            placeholder="User sees this description on the completion page..."
                                            disabled={isReadOnly}
                                            style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Persona Setup & Logic */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Persona & Scoring Engine</h3>

                {/* Influencer Tagging (only if editing an influencer) */}
                {currentInfluencer && (
                    <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                        <h4 style={{ margin: '0 0 1rem 0' }}>Influencer Category (Source)</h4>
                        <select
                            value={currentInfluencer.type || ''}
                            onChange={(e) => updateInfluencer(currentInfluencer.id, { type: e.target.value })}
                            disabled={isReadOnly}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">Select Category...</option>
                            <option value="Luxury/Travel Blogger">Luxury/Travel Blogger</option>
                            <option value="Family Vlogger">Family Vlogger</option>
                            <option value="Foodie Influencer">Foodie Influencer</option>
                            <option value="Digital Nomad">Digital Nomad / Tech Pro</option>
                        </select>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>This tag dictates the starting persona weights for users arriving via this influencer.</p>
                    </div>
                )}

                {/* Weights & Multipliers editor */}
                {formData.personas && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
                            <h4 style={{ margin: '0 0 1rem 0' }}>Experience Priority Weights</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>1st Scene (+pts)</label>
                                    <input type="number" value={formData.personas.priorityWeights.first} onChange={(e) => handleChange('personas', 'priorityWeights', Number(e.target.value), 'first')} disabled={isReadOnly} style={{ width: '100%', padding: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>2nd Scene (+pts)</label>
                                    <input type="number" value={formData.personas.priorityWeights.second} onChange={(e) => handleChange('personas', 'priorityWeights', Number(e.target.value), 'second')} disabled={isReadOnly} style={{ width: '100%', padding: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>Last Scene (+pts)</label>
                                    <input type="number" value={formData.personas.priorityWeights.last} onChange={(e) => handleChange('personas', 'priorityWeights', Number(e.target.value), 'last')} disabled={isReadOnly} style={{ width: '100%', padding: '4px' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
                            <h4 style={{ margin: '0 0 1rem 0' }}>Dwell Time Weights</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>High Engagement (ms)</label>
                                    <input type="number" value={formData.personas.dwellWeights.minMs} onChange={(e) => handleChange('personas', 'dwellWeights', Number(e.target.value), 'minMs')} disabled={isReadOnly} style={{ width: '100%', padding: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>High Eng. Points</label>
                                    <input type="number" value={formData.personas.dwellWeights.highPoints} onChange={(e) => handleChange('personas', 'dwellWeights', Number(e.target.value), 'highPoints')} disabled={isReadOnly} style={{ width: '100%', padding: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>Low Engagement (ms)</label>
                                    <input type="number" value={formData.personas.dwellWeights.maxMs} onChange={(e) => handleChange('personas', 'dwellWeights', Number(e.target.value), 'maxMs')} disabled={isReadOnly} style={{ width: '100%', padding: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem' }}>Low Eng. Points</label>
                                    <input type="number" value={formData.personas.dwellWeights.lowPoints} onChange={(e) => handleChange('personas', 'dwellWeights', Number(e.target.value), 'lowPoints')} disabled={isReadOnly} style={{ width: '100%', padding: '4px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '4rem' }}>
                <button
                    onClick={async () => {
                        if (confirm("SHIP TO LIVE? This will commit and push your content to GitHub, triggering a Vercel deploy.")) {
                            try {
                                const res = await fetch('/api/git-sync');
                                const data = await res.json();
                                if (data.success) alert("🚀 LIVE SHIP SUCCESSFUL! Vercel is building...");
                                else alert("❌ Ship failed: " + data.error);
                            } catch (e) { alert("API Error: Sync failed"); }
                        }
                    }}
                    style={{
                        padding: '1rem 2rem',
                        backgroundColor: '#FF1744',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 10px rgba(255, 23, 68, 0.3)'
                    }}
                >
                    🚢 SHIP TO LIVE
                </button>

                <button
                    onClick={handleSave}
                    disabled={isReadOnly || isSaving}
                    style={{
                        padding: '1rem 2rem',
                        backgroundColor: isReadOnly ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isReadOnly ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    {isSaving ? 'Publishing...' : (isReadOnly ? 'Read Only' : 'Publish Changes')}
                </button>
            </div>
        </div >
    );
};

export default ConfigDashboard;
