import Buyer from '../models/Buyer.js';

// @desc    Get all buyers
// @route   GET /api/buyers
// @access  Private
export const getBuyers = async (req, res) => {
    try {
        const buyers = await Buyer.find({}).sort({ updatedAt: -1 });
        res.json(buyers);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching buyers' });
    }
};

// @desc    Create a buyer
// @route   POST /api/buyers
// @access  Private
export const createBuyer = async (req, res) => {
    const { name, phone } = req.body;

    try {
        const existingBuyer = await Buyer.findOne({ name });
        if (existingBuyer) {
            return res.status(400).json({ message: 'Buyer with this name already exists' });
        }

        const buyer = new Buyer({
            name,
            phone: phone || '',
        });

        const createdBuyer = await buyer.save();
        res.status(201).json(createdBuyer);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating buyer' });
    }
};

// @desc    Get single buyer
// @route   GET /api/buyers/:id
// @access  Private
export const getBuyerById = async (req, res) => {
    try {
        const buyer = await Buyer.findById(req.params.id);
        if (buyer) {
            res.json(buyer);
        } else {
            res.status(404).json({ message: 'Buyer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a buyer
// @route   PUT /api/buyers/:id
// @access  Private
export const updateBuyer = async (req, res) => {
    const { name, phone } = req.body;

    try {
        const buyer = await Buyer.findById(req.params.id);

        if (buyer) {
            buyer.name = name || buyer.name;
            buyer.phone = phone || buyer.phone;

            const updatedBuyer = await buyer.save();
            res.json(updatedBuyer);
        } else {
            res.status(404).json({ message: 'Buyer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a buyer
// @route   DELETE /api/buyers/:id
// @access  Private
export const deleteBuyer = async (req, res) => {
    try {
        const buyer = await Buyer.findById(req.params.id);

        if (buyer) {
            // Note: In a real production system, we should either soft delete
            // or also delete/re-assign all related transactions and payments.
            // For simplicity, we just delete the buyer.
            await buyer.deleteOne();
            res.json({ message: 'Buyer removed' });
        } else {
            res.status(404).json({ message: 'Buyer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
