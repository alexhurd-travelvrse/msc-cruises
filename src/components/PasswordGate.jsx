import React, { useState, useEffect } from 'react';
import './PasswordGate.css';

const PasswordGate = ({ children }) => {
    const [password, setPassword] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const authorized = sessionStorage.getItem('travelvrse_authorized');
        if (authorized === 'true') {
            setIsAuthorized(true);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password.toLowerCase() === 'travelvrse') {
            sessionStorage.setItem('travelvrse_authorized', 'true');
            setIsAuthorized(true);
            setError('');
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    if (isAuthorized) {
        return children;
    }

    return (
        <div className="password-gate">
            <div className="password-container">
                <div className="logo-container">
                    <img src="/assets/vite.svg" alt="Travelvrse" className="gate-logo" />
                </div>
                <h2>Exclusive Access</h2>
                <p>Please enter the password to view the Barcelona experience.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="password-input"
                        autoFocus
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-btn">
                        Enter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordGate;
