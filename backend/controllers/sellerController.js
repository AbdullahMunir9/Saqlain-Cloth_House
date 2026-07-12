import Seller from '../models/Seller.js';
import Transaction from '../models/Transaction.js';
import Payment from '../models/Payment.js';

// @desc    Get all sellers
// @route   GET /api/sellers
// @access  Private
export const getSellers = async (req, res) => {
    try {
        const sellers = await Seller.find({}).sort({ updatedAt: -1 });
        res.json(sellers);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching sellers' });
    }
};

// @desc    Create a seller
// @route   POST /api/sellers
// @access  Private
export const createSeller = async (req, res) => {
    const { name, phone } = req.body;

    try {
        const existingSeller = await Seller.findOne({ name });
        if (existingSeller) {
            return res.status(400).json({ message: 'Seller with this name already exists' });
        }

        const seller = new Seller({
            name,
            phone: phone || '',
        });

        const createdSeller = await seller.save();
        res.status(201).json(createdSeller);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating seller' });
    }
};

// @desc    Get single seller
// @route   GET /api/sellers/:id
// @access  Private
export const getSellerById = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (seller) {
            res.json(seller);
        } else {
            res.status(404).json({ message: 'Seller not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a seller
// @route   PUT /api/sellers/:id
// @access  Private
export const updateSeller = async (req, res) => {
    const { name, phone } = req.body;

    try {
        const seller = await Seller.findById(req.params.id);

        if (seller) {
            seller.name = name || seller.name;
            seller.phone = phone || seller.phone;

            const updatedSeller = await seller.save();
            res.json(updatedSeller);
        } else {
            res.status(404).json({ message: 'Seller not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a seller
// @route   DELETE /api/sellers/:id
// @access  Private
export const deleteSeller = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);

        if (seller) {
            // Delete all related transactions and payments
            await Transaction.deleteMany({ entityId: seller._id, type: 'buy' });
            await Payment.deleteMany({ entityId: seller._id, type: 'pay' });

            await seller.deleteOne();
            res.json({ message: 'Seller and associated records removed' });
        } else {
            res.status(404).json({ message: 'Seller not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
