import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

export default mongoose.model('Cart', new mongoose.Schema(
    {
        userId: { type: ObjectId, ref: 'User', required: true, unique: true, trim: true },
        items: [{
            productId: { type: ObjectId, ref: 'Product', required: true, trim: true },
            quantity: { type: Number, required: true, min: 1 }
        }],
        totalPrice: { type: Number, required: true },
        totalItems: { type: Number, required: true },
    }, { timestamp: true }
));
