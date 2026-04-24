import React, { useState, useEffect } from 'react';
import { useInfluencer } from '../../context/InfluencerContext';
import VoiceRecorder from '../../components/VoiceRecorder';

const ConfigDashboard = () => {
    const { activeWhitelabelId, manifest } = useInfluencer();
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (manifest) {
            setFormData(JSON.parse(JSON.stringify(manifest)));
        }
    }, [manifest]);

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleNestedChange = (section, subSection, field, value) => {
        setFormData(prev => {
            if (!subSection) {
                return {
                    ...prev,
                    [section]: {
                        ...(prev[section] || {}),
                        [field]: value
                    }
                };
            }
            return {
                ...prev,
                [section]: {
                    ...(prev[section] || {}),
                    [subSection]: {
                        ...(prev[section]?.[subSection] || {}),
                        [field]: value
                    }
                }
            };
        });
    };

    const handleVoiceoverChange = async (key, audioData) => {
        if (!audioData) {
            setFormData(prev => ({
                ...prev,
                creator_metadata: {
                    ...prev.creator_metadata,
                    voiceovers: { ...prev.creator_metadata?.voiceovers, [key]: null }
                }
            }));
            return;
        }

        try {
            console.log(`[ConfigDashboard] Uploading audio for ${key}...`);
            const response = await fetch('/api/save-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: activeWhitelabelId,
                    audioKey: key,
                    audioData: audioData
                })
            });
            const result = await response.json();
            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    creator_metadata: {
                        ...prev.creator_metadata,
                        voiceovers: {
                            ...prev.creator_metadata?.voiceovers,
                            [key]: result.path
                        }
                    }
                }));
                console.log(`[ConfigDashboard] ✓ Audio saved to ${result.path}`);
            } else {
                alert("Failed to save audio: " + result.error);
            }
        } catch (error) {
            console.error("Audio save error:", error);
            alert("Error saving audio file.");
        }
    };

    // --- EXPERIENCE EDITOR LOGIC ---
    
    const handleExperienceChange = (idx, field, value) => {
        const newExps = [...formData.challenge_configuration.experiences];
        newExps[idx] = { ...newExps[idx], [field]: value };
        setFormData(prev => ({
            ...prev,
            challenge_configuration: { ...prev.challenge_configuration, experiences: newExps }
        }));
    };

    const handleIconChange = (expIdx, iconIdx, field, value) => {
        const newExps = [...formData.challenge_configuration.experiences];
        const newIcons = [...newExps[expIdx].backpack_icons];
        
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            newIcons[iconIdx] = { 
                ...newIcons[iconIdx], 
                [parent]: { ...newIcons[iconIdx][parent], [child]: parseFloat(value) || 0 } 
            };
        } else {
            newIcons[iconIdx] = { ...newIcons[iconIdx], [field]: value };
        }
        
        newExps[expIdx] = { ...newExps[expIdx], backpack_icons: newIcons };
        setFormData(prev => ({
            ...prev,
            challenge_configuration: { ...prev.challenge_configuration, experiences: newExps }
        }));
    };

    const addExperience = () => {
        const newExp = {
            exp_id: (formData.challenge_configuration.experiences.length + 1).toString(),
            name: "New Experience",
            splat_url: "",
            backpack_icons: []
        };
        setFormData(prev => ({
            ...prev,
            challenge_configuration: { 
                ...prev.challenge_configuration, 
                experiences: [...prev.challenge_configuration.experiences, newExp],
                total_experiences: prev.challenge_configuration.experiences.length + 1
            }
        }));
    };

    const addIcon = (expIdx) => {
        const newIcon = {
            id: `item${expIdx + 1}-${formData.challenge_configuration.experiences[expIdx].backpack_icons.length + 1}`,
            coordinates: { x: 0, y: 1, z: 0 },
            content_type: "info",
            data_tag: "culture_seeker",
            reward_label: "New Insight"
        };
        const newExps = [...formData.challenge_configuration.experiences];
        newExps[expIdx].backpack_icons.push(newIcon);
        setFormData(prev => ({
            ...prev,
            challenge_configuration: { ...prev.challenge_configuration, experiences: newExps }
        }));
    };

    if (!formData) return <div>Loading...</div>;

    const brandAssets = formData.client_metadata?.brand_assets || {};

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#1a1a1a', fontSize: '2.5rem', fontWeight: '800' }}>Platform Configuration</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                        Tenant: <span style={{ color: '#007bff', fontWeight: '600' }}>{formData.client_metadata?.hotel_name || activeWhitelabelId}</span>
                    </p>
                </div>
                <button
                    onClick={() => {
                        const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `manifest_${activeWhitelabelId}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        alert("✓ Manifest Exported!");
                    }}
                    style={{
                        padding: '1rem 2rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 20px rgba(0, 123, 255, 0.2)'
                    }}
                >
                    💾 EXPORT CONFIG
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
                
                {/* LEFT COLUMN: BRAND & CORE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <Section title="Brand Identity" icon="🎨">
                        <Field label="Property Name" value={formData.client_metadata?.hotel_name} onChange={(v) => handleChange('client_metadata', 'hotel_name', v)} />
                        <Field label="Hero Text" value={brandAssets.hero_text} onChange={(v) => handleNestedChange('client_metadata', 'brand_assets', 'hero_text', v)} />
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem' }}>Primary Theme</label>
                            <input type="color" value={brandAssets.primary_color || '#00e5ff'} onChange={(e) => handleNestedChange('client_metadata', 'brand_assets', 'primary_color', e.target.value)} style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }} />
                        </div>
                        <Field label="Partner Logo URL" value={brandAssets.hotel_logo_url} onChange={(v) => handleNestedChange('client_metadata', 'brand_assets', 'hotel_logo_url', v)} />
                    </Section>

                    <Section title="Teleport Experience" icon="🌀">
                        <Field label="Teleport Title" value={formData.teleport?.backpackTitle} onChange={(v) => handleChange('teleport', 'backpackTitle', v)} />
                        <Field label="Teleport Subtitle" value={formData.teleport?.backpackDesc} onChange={(v) => handleChange('teleport', 'backpackDesc', v)} />
                        <Field label="Warp Hero Image" value={formData.teleport?.heroImage} onChange={(v) => handleChange('teleport', 'heroImage', v)} />
                        <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '-0.5rem' }}>This image appears after the warp animation ends.</p>
                    </Section>

                    <Section title="Home Benefits" icon="✨">
                        {[0, 1, 2].map(idx => (
                            <Field key={idx} label={`Bullet #${idx + 1}`} value={brandAssets.benefits?.[idx]} onChange={(v) => {
                                const b = [...(brandAssets.benefits || ['', '', ''])];
                                b[idx] = v;
                                handleNestedChange('client_metadata', 'brand_assets', 'benefits', b);
                            }} />
                        ))}
                        <Field label="Highlighted Box" value={brandAssets.highlighted_benefit} onChange={(v) => handleNestedChange('client_metadata', 'brand_assets', 'highlighted_benefit', v)} />
                    </Section>

                    <Section title="Guide & Audio" icon="🎙️">
                        <Field label="Orb Image URL" value={formData.creator_metadata?.orb_image_url} onChange={(v) => handleNestedChange('creator_metadata', null, 'orb_image_url', v)} />
                        
                        <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', color: '#333' }}>🏠 Home Voiceover</label>
                            <VoiceRecorder 
                                initialAudio={formData.creator_metadata?.voiceovers?.home} 
                                guideText={formData.audio?.home || "Welcome to our experience!"}
                                onSave={(audioData) => handleVoiceoverChange('home', audioData)}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', color: '#333' }}>🚀 Teleport Voiceover</label>
                            <VoiceRecorder 
                                initialAudio={formData.creator_metadata?.voiceovers?.teleport} 
                                guideText={formData.audio?.teleport || "Where would you like to go next?"}
                                onSave={(audioData) => handleVoiceoverChange('teleport', audioData)}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', color: '#333' }}>🏆 Completion Voiceover</label>
                            <VoiceRecorder 
                                initialAudio={formData.creator_metadata?.voiceovers?.completion} 
                                guideText={formData.audio?.completion || "Congratulations on completing the challenge!"}
                                onSave={(audioData) => handleVoiceoverChange('completion', audioData)}
                            />
                        </div>
                    </Section>
                </div>

                {/* RIGHT COLUMN: EXPERIENCES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>🏗️ Experience Builder</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={addExperience} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>+ Add Scene</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {formData.challenge_configuration.experiences.map((exp, expIdx) => (
                                <div key={expIdx} style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '12px', background: '#fafafa' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1, marginRight: '1rem' }}>
                                            <Field label="Scene Name" value={exp.name} onChange={(v) => handleExperienceChange(expIdx, 'name', v)} />
                                        </div>
                                        <a 
                                            href={`/experience/${exp.exp_id}?editor=true`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            style={{ padding: '0.6rem 1rem', background: '#333', color: '#FFD700', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #FFD700' }}
                                        >
                                            👁️ VISUAL EDITOR
                                        </a>
                                    </div>
                                    <Field label="Splat URL (.splat)" value={exp.splat_url} onChange={(v) => handleExperienceChange(expIdx, 'splat_url', v)} />

                                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#666' }}>Backpack Items / Splat Icons</h4>
                                            <button onClick={() => addIcon(expIdx)} style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Item</button>
                                        </div>

                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                                        <th style={{ padding: '8px', minWidth: '120px' }}>Label</th>
                                                        <th style={{ padding: '8px' }}>Type</th>
                                                        <th style={{ padding: '8px' }}>Media URL</th>
                                                        <th style={{ padding: '8px' }}>Video/YT</th>
                                                        <th style={{ padding: '8px' }}>Description</th>
                                                        <th style={{ padding: '8px' }}>Reward URL (PDF/MP3)</th>
                                                        <th style={{ padding: '8px' }}>Discovery</th>
                                                        <th style={{ padding: '8px' }}>Tag</th>
                                                        <th style={{ padding: '8px' }}>X</th>
                                                        <th style={{ padding: '8px' }}>Y</th>
                                                        <th style={{ padding: '8px' }}>Z</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {exp.backpack_icons.map((icon, iconIdx) => (
                                                        <tr key={iconIdx} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                            <td style={{ padding: '4px' }}><input type="text" value={icon.reward_label} onChange={(e) => handleIconChange(expIdx, iconIdx, 'reward_label', e.target.value)} style={tableInput} placeholder="Title" /></td>
                                                            <td style={{ padding: '4px' }}>
                                                                <select value={icon.content_type || 'info'} onChange={(e) => handleIconChange(expIdx, iconIdx, 'content_type', e.target.value)} style={tableInput}>
                                                                    <option value="info">Info</option>
                                                                    <option value="collectible">Collectible</option>
                                                                </select>
                                                            </td>
                                                            <td style={{ padding: '4px' }}><input type="text" value={icon.media || ''} onChange={(e) => handleIconChange(expIdx, iconIdx, 'media', e.target.value)} style={tableInput} placeholder="/assets/image.jpg" /></td>
                                                            <td style={{ padding: '4px' }}><input type="text" value={icon.video || ''} onChange={(e) => handleIconChange(expIdx, iconIdx, 'video', e.target.value)} style={tableInput} placeholder="YouTube URL" /></td>
                                                            <td style={{ padding: '4px' }}><input type="text" value={icon.description || ''} onChange={(e) => handleIconChange(expIdx, iconIdx, 'description', e.target.value)} style={tableInput} placeholder="Body text..." /></td>
                                                            <td style={{ padding: '4px' }}>
                                                                <input 
                                                                    type="text" 
                                                                    value={icon.collectible?.url || ''} 
                                                                    onChange={(e) => {
                                                                        const newExps = [...formData.challenge_configuration.experiences];
                                                                        const newIcons = [...newExps[expIdx].backpack_icons];
                                                                        newIcons[iconIdx] = { 
                                                                            ...newIcons[iconIdx], 
                                                                            collectible: { ...(newIcons[iconIdx].collectible || {}), url: e.target.value, type: icon.content_type === 'collectible' ? 'medal' : 'pdf' } 
                                                                        };
                                                                        newExps[expIdx] = { ...newExps[expIdx], backpack_icons: newIcons };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            challenge_configuration: { ...prev.challenge_configuration, experiences: newExps }
                                                                        }));
                                                                    }} 
                                                                    style={tableInput} 
                                                                    placeholder="PDF/MP3 Path" 
                                                                />
                                                            </td>
                                                            <td style={{ padding: '4px' }}>
                                                                <select value={icon.discoveryMode || 'instant'} onChange={(e) => handleIconChange(expIdx, iconIdx, 'discoveryMode', e.target.value)} style={tableInput}>
                                                                    <option value="instant">Instant</option>
                                                                    <option value="scan">Scan (Orb)</option>
                                                                    <option value="sonic">Sonic (Proximity)</option>
                                                                </select>
                                                            </td>
                                                            <td style={{ padding: '4px' }}><input type="text" value={icon.data_tag} onChange={(e) => handleIconChange(expIdx, iconIdx, 'data_tag', e.target.value)} style={tableInput} placeholder="tag" /></td>
                                                            <td style={{ padding: '4px' }}><input type="number" step="0.1" value={icon.coordinates.x} onChange={(e) => handleIconChange(expIdx, iconIdx, 'coordinates.x', e.target.value)} style={{ ...tableInput, width: '50px' }} /></td>
                                                            <td style={{ padding: '4px' }}><input type="number" step="0.1" value={icon.coordinates.y} onChange={(e) => handleIconChange(expIdx, iconIdx, 'coordinates.y', e.target.value)} style={{ ...tableInput, width: '50px' }} /></td>
                                                            <td style={{ padding: '4px' }}><input type="number" step="0.1" value={icon.coordinates.z} onChange={(e) => handleIconChange(expIdx, iconIdx, 'coordinates.z', e.target.value)} style={{ ...tableInput, width: '50px' }} /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, icon, children }) => (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '2px solid #f0f0f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '800' }}>
            <span>{icon}</span> {title}
        </h3>
        {children}
    </div>
);

const Field = ({ label, value, onChange }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', color: '#444' }}>{label}</label>
        <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
    </div>
);

const tableInput = {
    width: '100%',
    padding: '6px',
    border: '1px solid #eee',
    borderRadius: '4px',
    fontSize: '0.8rem',
    boxSizing: 'border-box'
};

export default ConfigDashboard;
