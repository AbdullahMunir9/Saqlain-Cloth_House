import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        default: '',
    },
    totalPurchasedAmount: {
        type: Number,
        default: 0,
    },
    totalPaidAmount: {
        type: Number,
        default: 0,
    },
    totalRemainingAmount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

const Seller = mongoose.model('Seller', sellerSchema);
export default Seller;
