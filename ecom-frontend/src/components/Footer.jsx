import './Footer.css'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>About Us</h3>
                        <p>Your trusted online shopping destination for quality products at great prices.</p>
                    </div>

                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="/">Products</a></li>
                            <li><a href="/admin">Admin</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Contact</h3>
                        <p>Email: support@ecommerce.com</p>
                        <p>Phone: +1 (555) 123-4567</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 Maa-Creation. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer

