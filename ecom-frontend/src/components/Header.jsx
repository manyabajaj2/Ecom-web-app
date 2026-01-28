import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const Header = () => {
    const location = useLocation()

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <h1 className="logo-title">Maa-Creation</h1>
                    </Link>

                    <nav className="nav">
                        <Link
                            to="/"
                            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            Products
                        </Link>
                        <Link
                            to="/admin"
                            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                        >
                            Admin
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Header

