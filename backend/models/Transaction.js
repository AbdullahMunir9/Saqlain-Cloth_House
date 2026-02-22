import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    total: { type: Number, required: true },
});

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'entityModel'
    },
    entityModel: {
        type: String,
        required: true,
        enum: ['Buyer', 'Seller']
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    items: [itemSchema],
    totalBill: {
        type: Number,
        required: true
    },
    paidNow: {
        type: Number,
        default: 0
    },
    remainingAfterTransaction: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
