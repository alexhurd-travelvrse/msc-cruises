import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const RankingPage = () => {
    const navigate = useNavigate();
    const { updateInterest } = useGame();

    const experiences = [
        { id: 1, title: 'Luxury', category: 'The Sovereign', img: '/assets/balcony_grab.png' },
        { id: 2, title: 'Spa', category: 'Wellness Voyager', img: '/assets/spa_grab.png' },
        { id: 3, title: 'Hola Restaurant', category: 'Social Foodie', img: '/assets/hola_grab.png' },
        { id: 4, title: 'Kids Activities', category: 'Family Planner', img: '/assets/arcade_filler.jpg' },
        { id: 5, title: 'Excursion Spot', category: 'Culture Seeker', img: '/assets/excursion_filler.jpg' },
    ];

    const [selected, setSelected] = useState([]);

    const toggleExperience = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
        } else {
            if (selected.length < 5) {
                setSelected([...selected, id]);
            }
        }
    };

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', textAlign: 'center', minHeight: '100vh' }}>
            <h1 className="hero-title text-gradient animate-fade-in" style={{ fontSize: '3.5rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: '400' }}>RANK YOUR EXPERIENCE</h1>
            <p className="hero-subtitle animate-fade-in animate-delay-1" style={{ color: 'var(--color-text-muted)', marginBottom: '3rem' }}>Select the experiences you want to see first (Order matters {selected.length}/5)</p>

            <div className="experience-grid animate-fade-in animate-delay-2" style={{ marginBottom: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {experiences.map((exp) => {
                    const index = selected.indexOf(exp.id);
                    const isSelected = index !== -1;

                    return (
                        <div
                            key={exp.id}
                            onClick={() => toggleExperience(exp.id)}
                            className={`experience-card-small ${isSelected ? 'selected' : ''}`}
                            style={{ 
                                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), transparent), url(${exp.img})`,
                                height: '240px',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                        >
                            <div className="card-title" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '1px', fontSize: '1.2rem' }}>{exp.title}</div>

                            {isSelected && (
                                <div className="selection-badge" style={{ background: 'var(--color-accent-primary)', color: 'white', fontWeight: '800', width: '35px', height: '35px', fontSize: '1.2rem' }}>
                                    {index + 1}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selected.length === 5 && (
                <div className="animate-fade-in animate-delay-3">
                    <button
                        onClick={() => {
                            selected.forEach((id, index) => {
                                const exp = experiences.find(e => e.id === id);
                                if (exp) {
                                    const points = (5 - index) * 10;
                                    updateInterest(exp.category, points);
                                }
                            });
                            navigate(`/experience/${selected[0]}`);
                        }}
                        className="btn-primary"
                        style={{ padding: '1.2rem 4rem', fontSize: '1.2rem' }}
                    >
                        START CHALLENGE
                    </button>
                </div>
            )}
        </div>
    );
};

export default RankingPage;
