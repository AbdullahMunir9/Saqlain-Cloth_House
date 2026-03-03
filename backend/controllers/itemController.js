import Item from '../models/Item.js';

// @desc    Get items (can filter by sellerId or inStock)
// @route   GET /api/items
// @access  Private
export const getItems = async (req, res) => {
    try {
        const { sellerId, inStock } = req.query;
        let query = {};

        if (sellerId) {
            query.sellerId = sellerId;
        }
        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        }

        const items = await Item.find(query).populate('sellerId', 'name').sort({ name: 1 });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching items' });
    }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Private
export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('sellerId', 'name');
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching item' });
    }
};
