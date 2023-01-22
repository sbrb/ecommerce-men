const express = require('express');
const router = express.Router();
const { createUser, login, gateUser, updateUser } = require('../controllers/userController');
const { createProduct, getProductByQuery, getProductById, updateProduct, deleteProduct } = require('../controllers/productController.js');
const { createCart, updateCart, getCart, deleteCart } = require( '../controllers/cartController.js');
const { createOrder, updateOrder } = require( '../controllers/orderController.js');
const { authentication, authorization } = require( '../middleware/auth.js');

//FEATURE I - User
router.post('/register', createUser);
router.post('/login', login);
router.get('/user/:userId/profile', authentication, gateUser);
router.put('/user/:userId/profile', authentication, authorization, updateUser);

//FEATURE II - Product
router.post('/products', createProduct);
router.get('/products', getProductByQuery);
router.get('/products/:productId', getProductById);
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);

//FEATURE III - cart
router.post('/users/:userId/cart', authentication, authorization, createCart);
router.put('/users/:userId/cart', authentication, authorization, updateCart);
router.get('/users/:userId/cart', authentication, authorization, getCart);
router.delete('/users/:userId/cart', authentication, authorization, deleteCart);

//FEATURE IV - Order
router.post('/users/:userId/orders', authentication, authorization, createOrder);
router.put('/users/:userId/orders', authentication, authorization, updateOrder);

module.exports = router;