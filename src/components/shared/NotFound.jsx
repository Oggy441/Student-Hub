import { Link } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
    return (
        <div className="not-found-page">
            <h1 className="not-found-code">404</h1>
            <h2 className="not-found-title">Page Not Found</h2>
            <p className="not-found-message">
                The page you are looking for might have been removed, had its name changed,
                or is temporarily unavailable.
            </p>
            <Link to="/" className="not-found-btn">
                Go to Homepage
            </Link>
        </div>
    )
}

export default NotFound
