import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("[CRITICAL ERROR]", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', background: '#300', color: '#fdd', minHeight: '100vh' }}>
                    <h1>Something went wrong.</h1>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
                    <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={{ padding: '10px', background: '#f00', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        Emergency: Clear Data & Reset to Truth
                    </button>
                    <button onClick={() => window.location.reload()} style={{ marginLeft: '10px', padding: '10px' }}>
                        Retry Reload
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
