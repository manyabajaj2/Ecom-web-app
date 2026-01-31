const Product = require('../models/Product');

function getAccessKeyFromReq(req) {
    return req.body?.['access-key'] ?? req.body?.accessKey ?? req.headers?.['x-access-key'];
}

function requireAccessKey(req, res) {
    const providedKey = getAccessKeyFromReq(req);
    const expectedKey = process.env.ACCESS_KEY;

    if (!expectedKey) {
        res.status(500).json({ message: 'ACCESS_KEY is not configured on the server' });
        return false;
    }

    if (!providedKey || providedKey !== expectedKey) {
        res.status(401).json({ message: 'Unauthorized' });
        return false;
    }

    return true;
}

// GET /products?page=1&limit=10
async function getProducts(req, res) {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const [total, products] = await Promise.all([
            Product.countDocuments({}),
            Product.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ]);

        const totalPages = Math.max(Math.ceil(total / limit), 1);

        return res.json({
            page,
            limit,
            total,
            totalPages,
            count: products.length,
            products,
        });
    } catch (err) {
        console.error('getProducts error:', err.message || err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// POST /products
// Body: { name, desc, imageurl, images: [], price, "access-key": "..." }
async function createProduct(req, res) {
    try {
        if (!requireAccessKey(req, res)) return;

        const { name, desc, imageurl, images, price } = req.body || {};

        // Use images array if provided, otherwise use single imageurl for backward compatibility
        const imageList = images && Array.isArray(images) && images.length > 0 ? images : (imageurl ? [imageurl] : []);

        const product = await Product.create({
            name,
            desc,
            imageurl: imageurl || (imageList.length > 0 ? imageList[0] : ''),
            images: imageList,
            price,
        });

        return res.status(201).json(product);
    } catch (err) {
        console.error('createProduct error:', err.message || err);
        return res.status(400).json({ message: err.message || 'Invalid request' });
    }
}

// DELETE /products/:id
// Header: x-access-key: "..."
async function deleteProduct(req, res) {
    try {
        if (!requireAccessKey(req, res)) return;

        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.json({ message: 'Product deleted', id: deleted._id });
    } catch (err) {
        console.error('deleteProduct error:', err.message || err);
        return res.status(400).json({ message: err.message || 'Invalid request' });
    }
}

module.exports = { getProducts, createProduct, deleteProduct };


