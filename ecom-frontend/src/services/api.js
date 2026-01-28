import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || ''

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Products API - matches backend structure
export const productAPI = {
    // GET /products?page=1&limit=10
    getAll: (page = 1, limit = 10) => api.get('/products', { params: { page, limit } }),

    // POST /products - requires access-key
    create: (data, accessKey) => {
        const payload = {
            ...data,
            'access-key': accessKey
        }
        return api.post('/products', payload)
    },

    // DELETE /products/:id - requires access-key (sent via header)
    delete: (id, accessKey) => {
        return api.delete(`/products/${id}`, {
            headers: {
                'x-access-key': accessKey
            }
        })
    },
}

export default api

