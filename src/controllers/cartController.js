const cartModel = require('../models/cartModel.js');
const userModel = require('../models/userModel.js');
const { isValidBody, isValidObjectId } = require('../util/validator.js');
const productModel = require('../models/productModel.js');

//createCart
const createCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const reqBody = req.body;
        const { productId, cartId } = reqBody;

        if (!isValidBody(reqBody)) return res.status(400).json({ status: false, message: 'Please provide cart details.' });
        if (!userId) return res.status(400).json({ status: false, message: 'userId is required.' });
        if (!productId) return res.status(400).json({ status: false, message: 'Product Id is required' });

        if (!isValidObjectId(userId)) return res.status(400).json({ status: false, message: `'${userId}' this userId invalid.` });
        if (!isValidObjectId(productId)) return res.status(400).json({ status: false, message: `'${productId}' this productId invalid.` });

        //userExist
        const userExist = await userModel.findById(userId);
        if (!userExist) return res.status(404).json({ status: false, message: `No user found by '${userId}' this userId.` });

        //existProduct
        const existProduct = await productModel.findById(productId);
        if (!existProduct) return res.status(404).json({ status: false, message: `No user found by '${productId}' this productId.` });
        if (existProduct.isDeleted === true) return res.status(400).json({ status: false, message: `'${existProduct.title}' this product already deleted.` });

        if (cartId) {
            if (!isValidObjectId(cartId)) return res.status(400).json({ status: false, message: `'${cartId}' this cartId invalid.` });
            var existCart = await cartModel.findById(cartId)
            if (!existCart) return res.status(404).json({ status: false, message: `No cart found by '${cartId}' this cartId.` });
        }

        //haveCart
        const haveCart = await cartModel.findOne({ userId });
        if (haveCart && !cartId) return res.status(400).json({ status: false, message: `'${userExist.fname} ${userExist.lname}'- please provide cartId.` });

        if (existCart) {
            if (existCart.userId.toString() !== userId) return res.status(400).json({ status: false, message: `'${userExist.fname} ${userExist.lname}'- this cart doesn't belong to you.` });
            const productArray = existCart.items;
            const totPrice = (existCart.totalPrice + existProduct.price);
            const pId = existProduct._id.toString();
            for (let i = 0; i < productArray.length; i++) {
                const produtInCart = productArray[i].productId.toString();

                if (pId === produtInCart) {
                    productArray[i].quantity = productArray[i].quantity + 1;
                    existCart.totalPrice = totPrice;
                    await existCart.save();
                    const addedProduct = await cartModel.findOne({ userId }).populate('items.productId', { __v: 0, _id: 0, isDeleted: 0, createdAt: 0, deletedAt: 0, currencyId: 0, currencyFormat: 0, updatedAt: 0, availableSizes: 0 });
                    return res.status(200).json({ status: true, message: `'${userExist.fname} ${userExist.lname}' you add '${existProduct.title}' product on your cart.`, data: addedProduct });
                }
            }
            existCart.items.push({ productId, quantity: 1 });
            existCart.totalPrice = existCart.totalPrice + existProduct.price;
            existCart.totalItems = existCart.items.length;
            await existCart.save();
            const addedProduct = await cartModel.findOne({ userId }).populate('items.productId', { __v: 0, _id: 0, isDeleted: 0, createdAt: 0, deletedAt: 0, currencyId: 0, currencyFormat: 0, updatedAt: 0, availableSizes: 0 });
            return res.status(200).json({ status: true, message: 'Success', data: addedProduct });
        };

        let obj = {
            userId: userId,
            items: [{ productId: productId, quantity: 1 }],
            totalPrice: existProduct.price
        };
        obj['totalItems'] = obj.items.length;

        const savedData = await cartModel.create(obj);
        return res.status(201).json({ status: true, message: `'${userExist.fname} ${userExist.lname}'- your created successfully.`, data: savedData });
    } catch (err) {
        return res.status(500).json({ status: false, error: err.message });
    }
};

//updateCart
const updateCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const reqBody = req.body;
        const { productId, cartId, removeProduct } = reqBody;

        if (!isValidBody(reqBody)) return res.status(400).json({ status: false, message: 'Please provide details to update cart.' });

        if (!isValidObjectId(userId)) return res.status(400).json({ status: false, message: 'userId is not valid.' });
        if (!isValidObjectId(cartId)) return res.status(400).json({ status: false, message: 'cart is not valid.' });
        if (!isValidObjectId(productId)) return res.status(400).json({ status: false, message: 'productId is not valid.' });

        const existUser = await userModel.findById(userId);
        if (!existUser) return res.status(404).json({ status: false, message: `'${userId}' not found by by this userId.` });

        const existCart = await cartModel.findOne({ _id: cartId, userId });
        if (!existCart) return res.status(404).json({ status: false, message: 'cart does not exist.' });

        const existProduct = await productModel.findById(productId);
        if (!existProduct) return res.status(404).json({ status: false, message: 'Product not present' });
        if (existProduct.isDeleted === true) return res.status(404).json({ status: false, message: ` '${existProduct.title}'  is already deleted.` });

        const items = existCart.items;
        const productArr = items.filter(x => x.productId.toString() == productId);
        if (productArr.length === 0) return res.status(404).json({ status: false, message: 'Product is not present in cart' });

        const index = items.indexOf(productArr[0]);
        if (removeProduct === '') return res.status(400).json({ status: false, message: 'plz enter removeProduct' });

        if (removeProduct != 1 && removeProduct != 0) return res.status(400).json({ status: false, message: 'Value of Removed Product Must be 0 or 1.' });

        if (removeProduct == 0) {
            existCart.totalPrice = (existCart.totalPrice - (existProduct.price * existCart.items[index].quantity)).toFixed(2);
            existCart.items.splice(index, 1);
            existCart.totalItems = existCart.items.length;
            existCart.save();
        }

        if (removeProduct == 1) {
            existCart.items[index].quantity -= 1;
            existCart.totalPrice = (existCart.totalPrice - existProduct.price).toFixed(2);
            if (existCart.items[index].quantity == 0) {
                existCart.items.splice(index, 1);
            }
            existCart.totalItems = existCart.items.length;
            existCart.save();
        }
        return res.status(200).json({ status: true, message: 'Success', data: existCart });
    } catch (err) {
        return res.status(500).json({ status: false, error: err.message });
    }
};

//getCart
const getCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ status: false, message: 'userId is required on the param.' });
        if (!isValidObjectId(userId)) return res.status(400).json({ status: false, message: `'${userId}' this userId invalid.` });

        const existUser = await userModel.findById(userId);
        if (!existUser) return res.status(404).json({ status: false, message: `No user found by '${userId}' this userId.` });

        const foundCart = await cartModel.findOne({ userId }).populate('items.productId', { title: 1, productImage: 1, price: 1 });
        if (!foundCart) return res.status(400).json({ status: false, message: `Cart not found by '${userId}' this userId.` });

        return res.status(200).json({ status: true, message: 'Success', data: foundCart });
    }
    catch (err) {
        return res.status(500).json({ status: false, error: err.message });
    }
};

//deleteCart
const deleteCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ status: false, message: 'userId is required on the param.' });
        if (!isValidObjectId(userId)) return res.status(400).json({ status: false, message: `'${userId}' this userId invalid.` });

        const foundCart = await cartModel.findOne({ userId });
        if (!foundCart) return res.status(404).json({ status: false, message: `No cart found by '${userId}' this cartId.` });

        if (foundCart.totalItems === 0) return res.status(404).json({ status: false, message: `Cart is empty.` });

        const deleteCart = await cartModel.findOneAndUpdate({ userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true });
        return res.status(204).json({ status: true, message: `successfully deleted.`, data: deleteCart });
    }
    catch (err) {
        return res.status(500).json({ status: false, error: err.message });
    }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
