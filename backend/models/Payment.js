import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['receive', 'pay'], // receive from buyer, pay to seller
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
    amount: {
        type: Number,
        required: true
    },
    remainingAfterPayment: {
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

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
