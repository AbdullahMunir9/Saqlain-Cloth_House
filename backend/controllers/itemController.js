import Item from '../models/Item.js';
import Product from '../models/Product.js';

// @desc    Get items (can filter by sellerId, inStock, or active master products)
// @route   GET /api/items
// @access  Private
export const getItems = async (req, res) => {
    try {
        const { sellerId, inStock, activeOnly } = req.query;
        let query = {};

        if (sellerId) {
            query.sellerId = sellerId;
        }
        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        }

        // Items remain in the database for accounting/history, but products deleted
        // from the master list must not be selectable in a new sale.
        if (activeOnly === 'true') {
            const products = await Product.find({}, { name: 1 }).lean();
            query.itemName = { $in: products.map((product) => product.name) };
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

// @desc    Clear all available stock for an item without deleting the item record
// @route   DELETE /api/items/:id/stock
// @access  Private
export const clearItemStock = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        item.stock = 0;
        await item.save();

        res.json({ message: 'Stock cleared', item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error clearing stock' });
    }
};
