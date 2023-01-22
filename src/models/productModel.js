import mongoose from 'mongoose';

export default mongoose.model('Product', new mongoose.Schema(
    {
        title: { type: String, required: true, unique: true, trim: true },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true, trim: true },
        currencyId: { type: String, required: true, trim: true },
        currencyFormat: { type: String, required: true, trim: true },
        isFreeShipping: { type: Boolean, default: false },
        productImage: { type: String, required: true, trim: true },
        style: String,
        availableSizes: { type: [String], required: true, enum: ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'] },
        installments: Number,
        deletedAt: Date,
        isDeleted: { type: Boolean, default: false }
    }, { timestamps: true }
));

