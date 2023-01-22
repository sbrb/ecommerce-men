const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema(
    {
        userId: { type: ObjectId, ref: 'User', required: true, unique: true, trim: true },
        items: [{
            productId: { type: ObjectId, ref: 'Product', required: true, trim: true },
            quantity: { type: Number, required: true, min: 1 }
        }],
        totalPrice: { type: Number, required: true },
        totalItems: { type: Number, required: true },
    }, { timestamp: true }
);

module.exports = mongoose.model('Cart', cartSchema);
