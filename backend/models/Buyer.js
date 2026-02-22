import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        default: '',
    },
    totalBoughtAmount: {
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

const Buyer = mongoose.model('Buyer', buyerSchema);
export default Buyer;
