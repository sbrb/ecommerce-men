import orderModel from'../models/orderModel.js';
import userModel from'../models/userModel.js';
import cartModel from'../models/cartModel.js';
import productModel from'../models/productModel.js';
import { isValidBody, isValidObjectId, isValidIncludes } from'../util/validator.js';

//createOrder
export const createOrder = async (req, res) => {
    try {
        const userId = req.params.userId;
        const reqBody = req.body;
        const { cartId, cancellable, status } = reqBody;

        if (!isValidBody(reqBody)) return res.status(400).json({ status: false, message: 'Please provide product details.' });
        if (!userId) return res.status(400).json({ status: false, message: 'Please enter userId' });
        if (!cartId) return res.status(400).json({ status: false, message: 'Please enter cartId' });

        if (!isValidObjectId(userId)) return res.status(400).json({ status: false, message: `'${userId}' this userId invalid.` });
        if (!isValidObjectId(cartId)) return res.status(400).json({ status: false, message: 'cart id is not valid.' });

        //existUser
        const existUser = await userModel.findById(userId);
        if (!existUser) return res.status(404).json({ status: false, message: 'User not present.' });

        //existCart
        const existCart = await cartModel.findOne({ _id: cartId, userId });
        if (!existCart) return res.status(404).json({ status: false, message: 'No cart found.' });

        let itemsArr = existCart.items;
        if (itemsArr.length === 0) return res.status(400).json({ status: false, message: 'Cart is empty.' });

        let sum = 0;
        for (let i of itemsArr) sum += i.quantity;

        const newData = {
            userId: userId,
            items: existCart.items,
            totalPrice: existCart.totalPrice,
            totalItems: existCart.totalItems,
            totalQuantity: sum
        };

        //validation
        if (isValidIncludes('cancellable', reqBody)) {
            if (![true, false].includes(cancellable)) return res.status(400).json({ status: false, message: 'cancellable must be a boolean value.' });
            newData.cancellable = cancellable;
        }
        if (isValidIncludes('status', reqBody)) {
            if (!status) return res.status(400).json({ status: false, message: 'Please enter status.' });
            if (!['pending', 'completed', 'canceled'].includes(status)) return res.status(400).json({ status: false, message: 'status must be a pending,completed,canceled.' });
            newData.status = status;
        }

        const orderCreated = await orderModel.create(newData);

        //for product name
        const len = orderCreated.items.length;
        let name = '';
        for (let i = 0; i < len; i++) {
            const x = await productModel.findById(orderCreated.items[i].productId).select({ _id: 0, title: 1 });
            if (len === 1) name += x.title;
            else name += i + 1 + ')' + x.title + ', ';
        };
        name.split('');
        let orderedProduct = '';
        for (let i = 0; i < name.length - 2; i++) {
            orderedProduct += name[i]
        };

        //after completing order, everything is empty.
        existCart.items = []; existCart.totalItems = 0; existCart.totalPrice = 0; existCart.save();

        return res.status(201).json({ status: true, message: `'${orderedProduct}'- product ordered successfully.`, data: orderCreated });
    }
    catch (err) {
        return res.status(500).json({ status: false, error: err.message });
    }
};

//updateOrder
export const updateOrder = async (req, res) => {
    try {
        const reqBody = req.body;
        const userId = req.params.userId;
        const { orderId, status } = reqBody;
        if (!isValidBody(reqBody)) return res.status(400).json({ status: false, message: 'No data to update.' });

        if (!userId) return res.status(400).json({ status: false, message: 'Give userId in the Params.' });
        if (!orderId) return res.status(400).json({ status: false, message: 'Please Enter orderId.' });

        if (!isValidObjectId(userId)) return res.status(400).json({ status: false, message: 'Invalid UserId.' });
        if (!isValidObjectId(orderId)) return res.status(400).json({ status: false, message: 'Invalid orderId.' });

        //existCart
        const existCart = await cartModel.findOne({ userId });
        if (!existCart) return res.status(404).json({ status: false, message: 'There is no cart with these user.' });

        //existOrder
        const existOrder = await orderModel.findOne({ _id: orderId, userId });
        if (!existOrder) return res.status(404).json({ status: false, message: 'No such order from this user.' });
        if (existOrder.isDeleted == true) return res.status(400).json({ status: false, message: 'This Order is already deleted.' });

        if (existOrder.status === 'completed') return res.status(400).json({ status: false, message: 'This Order completed can not be cancelled.' });
        if (existOrder.status === 'canceled') return res.status(400).json({ status: false, message: 'This Order is already cancelled.' });

        if (status) {
            if (!status) return res.status(400).json({ status: false, message: 'Please Enter status' });
            if (!['pending', 'completed', 'canceled'].includes(status)) return res.status(400).json({ status: false, message: 'Status can only be pending , completed , canceled ' });
        }
        if (status == 'completed' || status == 'canceled') {
            if (existOrder.cancellable == false && status == 'completed') return res.status(400).json({ status: false, message: 'This order is cannot Cancel ' });
        }

        //existCart
        const existUser = await userModel.findById(userId);

        const updateOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: reqBody }, { new: true });
        return res.status(200).json({ status: true, message: `'${existUser.fname} ${existUser.lname}'- your order created successfully.`, Data: updateOrder });
    }
    catch (err) {
        return res.status(500).json({ status: false, error: err.message });
    }
};

