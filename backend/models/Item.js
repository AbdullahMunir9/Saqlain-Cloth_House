import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Seller'
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    purchasePrice: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Item = mongoose.model('Item', itemSchema);
export default Item;
