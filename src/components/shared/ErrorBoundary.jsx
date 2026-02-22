import React from 'react'
import './ErrorBoundary.css'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h1 className="error-boundary-title">Something went wrong.</h1>
                    <p className="error-boundary-message">
                        We&apos;re sorry, but an unexpected error has occurred.
                    </p>
                    <button
                        className="error-boundary-btn"
                        onClick={() => window.location.href = '/'}
                    >
                        Go Back Home
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
