import { useEffect, useState } from 'react'
import { productAPI } from '../services/api'
import './Admin.css'

const Admin = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [accessKey, setAccessKey] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        desc: '',
        imageurl: '',
        price: ''
    })
    const [formErrors, setFormErrors] = useState({})
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [imageMethod, setImageMethod] = useState('url') // 'url' or 'upload'
    const [uploadingImage, setUploadingImage] = useState(false)
    const [imagePreview, setImagePreview] = useState('')
    const limit = 10

    useEffect(() => {
        fetchProducts()
    }, [page])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await productAPI.getAll(page, limit)
            setProducts(response.data.products || [])
            setTotalPages(response.data.totalPages || 1)
            setError(null)
        } catch (err) {
            setError('Failed to load products. Please try again later.')
            console.error('Error fetching products:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
        // Update preview when URL changes
        if (name === 'imageurl' && imageMethod === 'url') {
            setImagePreview(value)
        }
    }

    const handleImageMethodChange = (e) => {
        const method = e.target.value
        setImageMethod(method)
        // Reset image URL when switching methods
        if (method === 'url') {
            setFormData(prev => ({ ...prev, imageurl: '' }))
            setImagePreview('')
        } else {
            setFormData(prev => ({ ...prev, imageurl: '' }))
            setImagePreview('')
        }
        // Clear errors
        if (formErrors.imageurl) {
            setFormErrors(prev => ({
                ...prev,
                imageurl: ''
            }))
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image size should be less than 10MB')
            return
        }

        setUploadingImage(true)
        setFormErrors(prev => ({ ...prev, imageurl: '' }))

        try {
            // Create form data for Cloudinary upload
            const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
            const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET

            if (!cloudName || !uploadPreset) {
                throw new Error(
                    'Cloudinary is not configured. Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in your frontend .env file, then restart the React server.'
                )
            }

            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', uploadPreset)
            const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const cloudinaryMsg =
                    errorData?.error?.message ||
                    errorData?.error ||
                    errorData?.message ||
                    'Upload failed'

                // Make the common unsigned preset error actionable
                if (typeof cloudinaryMsg === 'string' && cloudinaryMsg.toLowerCase().includes('unsigned')) {
                    throw new Error(
                        `${cloudinaryMsg}\n\nFix: In Cloudinary Dashboard → Settings → Upload → Upload presets, open your preset (“${uploadPreset}”) and enable “Unsigned”. Then restart the React app and try again.`
                    )
                }

                throw new Error(cloudinaryMsg)
            }

            const data = await response.json()

            // Set the secure URL from Cloudinary
            setFormData(prev => ({
                ...prev,
                imageurl: data.secure_url
            }))
            setImagePreview(data.secure_url)

        } catch (err) {
            console.error('Error uploading image:', err)
            alert('Failed to upload image: ' + err.message)
            setFormErrors(prev => ({
                ...prev,
                imageurl: 'Image upload failed'
            }))
        } finally {
            setUploadingImage(false)
        }
    }

    const validateForm = () => {
        const errors = {}
        if (!formData.name.trim()) errors.name = 'Name is required'
        if (!formData.desc.trim()) errors.desc = 'Description is required'
        if (!formData.imageurl.trim()) errors.imageurl = 'Image URL is required'
        if (!formData.price || parseFloat(formData.price) <= 0) {
            errors.price = 'Valid price is required'
        }
        if (!accessKey.trim()) errors.accessKey = 'Access key is required'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            const productData = {
                name: formData.name.trim(),
                desc: formData.desc.trim(),
                imageurl: formData.imageurl.trim(),
                price: parseFloat(formData.price)
            }

            // Create the updated product (keeps your "creates another product" behavior)
            await productAPI.create(productData, accessKey)

            // If editing, delete the old (unedited) product so we don't keep duplicates
            if (editingProduct?._id) {
                await productAPI.delete(editingProduct._id, accessKey)
            }

            // Clear access key after action (security)
            setAccessKey('')

            // Reset form and refresh products
            setFormData({ name: '', desc: '', imageurl: '', price: '' })
            setShowForm(false)
            setEditingProduct(null)
            fetchProducts()
            alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
        } catch (err) {
            if (err.response?.status === 401) {
                alert('Unauthorized! Please check your access key.')
            } else {
                alert('Failed to save product: ' + (err.response?.data?.message || err.message))
            }
            console.error('Error creating product:', err)
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            desc: product.desc,
            imageurl: product.imageurl,
            price: product.price.toString()
        })
        setImagePreview(product.imageurl)
        setImageMethod('url') // Default to URL when editing
        setShowForm(true)
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingProduct(null)
        setFormData({ name: '', desc: '', imageurl: '', price: '' })
        setFormErrors({})
        setImageMethod('url')
        setImagePreview('')
        setUploadingImage(false)
        setAccessKey('')
    }

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return
        }

        if (!accessKey) {
            alert('Please enter your access key first')
            return
        }

        try {
            await productAPI.delete(productId, accessKey)
            fetchProducts()
            setAccessKey('')
        } catch (err) {
            if (err.response?.status === 401) {
                alert('Unauthorized! Please check your access key.')
            } else {
                alert('Failed to delete product: ' + (err.response?.data?.message || err.message))
            }
        }
    }

    return (
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <h1 className="page-title">Admin Panel</h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setShowForm(!showForm)
                            if (showForm) handleCancel()
                        }}
                    >
                        {showForm ? 'Cancel' : 'Add New Product'}
                    </button>
                </div>

                {showForm && (
                    <div className="admin-form-container">
                        <h2 className="form-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form className="admin-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="accessKey">Access Key *</label>
                                <input
                                    type="password"
                                    id="accessKey"
                                    value={accessKey}
                                    onChange={(e) => setAccessKey(e.target.value)}
                                    placeholder="Enter your access key"
                                    className={formErrors.accessKey ? 'error' : ''}
                                />
                                {formErrors.accessKey && (
                                    <span className="error-message">{formErrors.accessKey}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="name">Product Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    className={formErrors.name ? 'error' : ''}
                                />
                                {formErrors.name && (
                                    <span className="error-message">{formErrors.name}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="desc">Description *</label>
                                <textarea
                                    id="desc"
                                    name="desc"
                                    value={formData.desc}
                                    onChange={handleInputChange}
                                    placeholder="Enter product description"
                                    rows="4"
                                    className={formErrors.desc ? 'error' : ''}
                                />
                                {formErrors.desc && (
                                    <span className="error-message">{formErrors.desc}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="imageMethod">Image Source *</label>
                                <select
                                    id="imageMethod"
                                    value={imageMethod}
                                    onChange={handleImageMethodChange}
                                    className="image-method-select"
                                >
                                    <option value="url">Image URL</option>
                                    <option value="upload">Upload Image</option>
                                </select>
                            </div>

                            {imageMethod === 'url' ? (
                                <div className="form-group">
                                    <label htmlFor="imageurl">Image URL *</label>
                                    <input
                                        type="url"
                                        id="imageurl"
                                        name="imageurl"
                                        value={formData.imageurl}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/image.jpg"
                                        className={formErrors.imageurl ? 'error' : ''}
                                    />
                                    {formErrors.imageurl && (
                                        <span className="error-message">{formErrors.imageurl}</span>
                                    )}
                                    {imagePreview && (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label htmlFor="imageUpload">Upload Image *</label>
                                    <div className="upload-container">
                                        <input
                                            type="file"
                                            id="imageUpload"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                            className="file-input"
                                        />
                                        <label htmlFor="imageUpload" className="file-label">
                                            {uploadingImage ? (
                                                <span>Uploading...</span>
                                            ) : (
                                                <span>Choose Image File</span>
                                            )}
                                        </label>
                                    </div>
                                    {uploadingImage && (
                                        <div className="upload-progress">
                                            <div className="spinner-small"></div>
                                            <span>Uploading image to Cloudinary...</span>
                                        </div>
                                    )}
                                    {formErrors.imageurl && (
                                        <span className="error-message">{formErrors.imageurl}</span>
                                    )}
                                    {imagePreview && (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Preview" />
                                            <span className="preview-label">Uploaded Image</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="price">Price *</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className={formErrors.price ? 'error' : ''}
                                />
                                {formErrors.price && (
                                    <span className="error-message">{formErrors.price}</span>
                                )}
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading && <div className="spinner"></div>}

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? (
                                        products.map(product => (
                                            <tr key={product._id}>
                                                <td>
                                                    <img
                                                        src={product.imageurl || 'https://via.placeholder.com/50x50?text=No+Image'}
                                                        alt={product.name}
                                                        className="table-image"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/50x50?text=No+Image'
                                                        }}
                                                    />
                                                </td>
                                                <td>{product.name}</td>
                                                <td className="desc-cell">{product.desc}</td>
                                                <td>₹{product.price?.toFixed(2)}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleEdit(product)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleDelete(product._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="no-data">
                                                No products found. Create your first product!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
                )}
            </div>
        </div>
    )
}

export default Admin

