import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfluencer } from '../../context/InfluencerContext';

const CompanySelectionPage = () => {
    const { companies, selectCompany } = useInfluencer();
    const navigate = useNavigate();

    const handleSelect = (company) => {
        selectCompany(company.id);
        navigate('/admin/config');
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', color: '#333' }}>Select a Campaign</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {companies.map(company => (
                    <div key={company.id} style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s',
                        opacity: company.status !== 'active' && company.status !== 'dumb' ? 0.5 : 1
                    }}>
                        <div style={{ height: '150px', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            {/* Placeholder for company image */}
                            <span style={{ fontSize: '3rem' }}>🚢</span>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0, color: '#333' }}>{company.name}</h3>
                                {company.status === 'active' && <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem' }}>Active</span>}
                                {company.status === 'dumb' && <span style={{ backgroundColor: '#e2e3e5', color: '#383d41', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem' }}>View Only</span>}
                            </div>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                {company.type === 'cruise' ? 'Cruise Line' : 'Hotel Resort'}
                            </p>

                            <button
                                onClick={() => handleSelect(company)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: company.status !== 'restricted' ? '#007bff' : '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: company.status !== 'restricted' ? 'pointer' : 'not-allowed'
                                }}
                                disabled={company.status === 'restricted'}
                            >
                                {company.status === 'active' ? 'Manage Configuration' : 'View Configuration'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompanySelectionPage;
