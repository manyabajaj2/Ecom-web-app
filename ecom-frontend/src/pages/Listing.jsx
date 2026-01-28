import { useEffect, useState } from 'react'
import { productAPI } from '../services/api'
import './Listing.css'

const Listing = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 12
    const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER

    useEffect(() => {
        fetchProducts()
    }, [page])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await productAPI.getAll(page, limit)
            setProducts(response.data.products || [])
            setTotalPages(response.data.totalPages || 1)
            setTotal(response.data.total || 0)
            setError(null)
        } catch (err) {
            setError('Failed to load products. Please try again later.')
            console.error('Error fetching products:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleWhatsAppClick = (product) => {
        const productLink = `${window.location.origin}/product/${product._id}`
        const message = `Interested. ${productLink}`
        const encodedMessage = encodeURIComponent(message)
        const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || process.env.Whatsapp_Number

        if (!whatsappNumber) {
            alert('WhatsApp number not configured. Please contact support.')
            return
        }

        // Use the whatsapp:// protocol for desktop/mobile app
        const whatsappAppUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`
        
        // For mobile, try the standard protocol first
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // Mobile device - use app URL directly
            window.location.href = whatsappAppUrl
        } else {
            // Desktop - open app with whatsapp:// scheme
            window.location.href = whatsappAppUrl
        }
    }

    return (
        <div className="listing-page">
            <div className="container">
                <h1 className="page-title">Products</h1>
                <p className="page-subtitle">Total: {total} products</p>

                {loading && <div className="spinner"></div>}

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {products.length > 0 ? (
                            <>
                                <div className="products-grid grid grid-3">
                                    {products.map(product => (
                                        <div key={product._id} className="product-card">
                                            <div className="product-image">
                                                <img
                                                    src={product.imageurl || 'https://via.placeholder.com/300x300?text=No+Image'}
                                                    alt={product.name}
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'
                                                    }}
                                                />
                                            </div>
                                            <div className="product-info">
                                                <h3 className="product-name">{product.name}</h3>
                                                <p className="product-desc">{product.desc}</p>
                                                <div className="product-footer">
                                                    <span className="product-price">₹{product.price?.toFixed(2)}</span>
                                                    <button
                                                        className="btn btn-buy"
                                                        onClick={() => handleWhatsAppClick(product)}
                                                        title="Contact on WhatsApp"
                                                    >
                                                        BUY
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </button>
                                        <span className="page-info">
                                            Page {page} of {totalPages}
                                        </span>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={page === totalPages}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-products">
                                <p>No products available at the moment.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Listing

