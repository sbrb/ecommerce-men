const getSymbolFromCurrency = require('currency-symbol-map');
const productModel = require('../models/productModel.js');
const { uploadFile } = require('../aws/aws-S3.js');
const { isValidBody, isValidPlainText, isValidDescription, isValidName, isValidObjectId, isValidPrice, isValidDes, isBoolean } = require('../util/validator.js');

//createProduct
const createProduct = async (req, res) => {
    try {
        const file = req.files;
        const reqBody = req.body;
        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = reqBody;
        let obj = {
            title: title,
            description: description,
            price: price,
            currencyId: currencyId,
            isFreeShipping: isFreeShipping,
            style: style,
            installments: installments
        };

        if (!isValidBody(reqBody)) return res.status(400).json({ status: false, message: 'Please provide product details.' });
        if (!title) return res.status(400).json({ status: false, message: 'title is required.' });
        if (!description) return res.status(400).json({ status: false, message: 'description is required.' });
        if (!price) return res.status(400).json({ status: false, message: 'price is required.' });
        if (!currencyId) return res.status(400).json({ status: false, message: 'currencyId is required.' });

        if (!isValidPlainText(title)) return res.status(400).json({ status: false, message: ` '${title}' this title is not valid.` });
        if (!isValidDescription(description)) return res.status(400).json({ status: false, message: ` '${description}' this description is not valid.` });
        if (!isValidPrice(price)) return res.status(400).json({ status: false, message: ` '${price}' this price is not valid.` });
        if (!isValidName(currencyId)) return res.status(400).json({ status: false, message: ` '${currencyId}' this currencyId is not valid.` });
        if (currencyId !== 'INR') return res.status(400).json({ status: false, message: 'INR should be the currency id.' })

        if (!currencyFormat) return res.status(400).json({ status: false, message: 'Please enter valid Indian currencyId (INR)for currency symbol.' });
        if (currencyFormat !== 'INR' && currencyFormat !== 'inr' && currencyFormat !== '₹') return res.status(400).json({ status: false, message: "Please use ('INR'/'inr'/'₹') for currencyFormat." });
        obj['currencyFormat'] = getSymbolFromCurrency('INR');

        if (isFreeShipping)
            if (!isBoolean(isFreeShipping)) return res.status(400).json({ status: false, message: 'isFreeShipping value should be boolean.' });

        if (style)
            if (!isValidDes(style)) return res.status(400).json({ status: false, message: `'${style}' this style invalid. only string allowed.` });

        if (!availableSizes) return res.status(400).json({ status: false, message: `Please enter valid & size from available ['S','XS','M','X','L','XXL','XL'].` });

        if (availableSizes) {
            let sizeArray = availableSizes.toUpperCase().split(',').map(x => x.trim());
            for (let i = 0; i < sizeArray.length; i++) {
                if (!(['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'].includes(sizeArray[i]))) return res.status(400).json({ status: false, message: `Please enter size from available sizes ['S','XS','M','X','L','XXL','XL'].` });
            }
            obj['availableSizes'] = sizeArray;
        };
        if (installments)
            if (!Number(installments)) return res.status(400).json({ status: false, message: 'installments should be valid & number.' });

        const dupTitle = await productModel.findOne({ title });
        if (dupTitle) return res.status(400).json({ status: false, message: `This '${title}' is already exist.` });

        if (!(file && file.length)) return res.status(400).json({ status: false, message: 'No file found.' });
        let uploadedFileUrl = await uploadFile(file[0]);
        obj['productImage'] = uploadedFileUrl;

        const saveProduct = await productModel.create(obj);
        return res.status(201).json({ status: true, message: ` '${title}' product created successfully.`, data: saveProduct });
    }
    catch (err) {
        return res.status(500).json({ status: false, error: err.message });
    }
};


//getProductByQuery
const getProductByQuery = async (req, res) => {
    try {
        const reqBody = req.query;
        let { name, priceGreaterThan, priceLessThan, size, priceSort, ...rest } = reqBody;
        let filters
        let obj = { isDeleted: false };
        priceSort = parseInt(priceSort);

        if (Object.keys(rest).length > 0) return res.status(400).json({ status: false, message: `You can't search by '${Object.keys(rest)}' key.` });

        if (size) {
            const sizeArray = size.toUpperCase().split(',').map(x => x.trim());
            for (let i = 0; i < sizeArray.length; i++) {
                if (!(['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'].includes(sizeArray[i]))) return res.status(400).json({ status: false, message: `Please enter size from available sizes ['S','XS','M','X','L','XXL','XL'].` });
            }
            obj['availableSizes'] = sizeArray;
        };
        if (name) {
            if (!isValidPlainText(name)) return res.status(400).json({ status: false, message: ` '${name}' this title is not valid.` });
            obj.title = { $regex: name.trim(), $options: 'i' };
        };
        if (priceGreaterThan) {
            if (!isValidPrice(priceGreaterThan)) return res.status(400).json({ status: false, message: ` '${priceGreaterThan}' this price is not valid.` });
            obj.price = { $gt: priceGreaterThan };
        };
        if (priceLessThan) {
            if (!isValidPrice(priceLessThan)) return res.status(400).json({ status: false, message: ` '${priceLessThan}' this price is not valid.` });
            obj.price = { $lt: priceLessThan };
        };
        if (priceGreaterThan && priceLessThan) obj.price = { $gt: priceGreaterThan, $lt: priceLessThan };

        if (priceSort > 1 || priceSort < -1 || priceSort === 0) return res.status(400).json({ status: false, message: `Please sort by '1' or '-1'.` });
        if (priceSort) filters = { price: priceSort };

        const products = await productModel.find(obj).sort(filters);
        if (products.length === 0) return res.status(404).json({ status: false, message: ` '${Object.values(reqBody)}' this product does't exist.` });

        return res.status(200).json({ status: true, message: `Success.`, data: products });
    }
    catch (err) {
        return res.status(500).json({ status: false, error: err.message });
    }
};


//getProductById
const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).json({ status: false, message: ` '${productId}' this productId is invalid.` });

        const existProduct = await productModel.findById(productId)
        if (!existProduct) return res.status(404).json({ status: false, message: `Product does't exits.` });

        if (existProduct.isDeleted === true) return res.status(400).json({ status: false, message: ` '${productId}' this productId already deleted.` })

        return res.status(200).json({ status: true, message: `Successful`, data: existProduct });
    }
    catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};


//updateProduct
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const reqBody = req.body;
        const file = req.files;
        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = reqBody;
        let obj = {};

        if (!productId) return res.status(400).json({ status: false, message: `product Id is required on path params.` });
        if (!isValidObjectId(productId)) return res.status(400).json({ status: false, message: ` '${productId}' this productId invalid.` });

        if (!isValidBody(reqBody)) return res.status(400).json({ status: false, message: `Please enter data for updation.` });

        if (description) {
            if (!isValidDes(description)) return res.status(400).json({ status: false, message: `'${description}' this description invalid.` });
            obj['description'] = description;
        };
        if (price) {
            if (!isValidPrice(price)) return res.status(400).json({ status: false, message: `'${price}' this price invalid(enter number).` });
            obj['price'] = price;
        };
        if (currencyId) {
            if (currencyId !== 'INR') return res.status(400).json({ status: false, message: `NR should be the currency id.` });
            obj['currencyId'] = currencyId;
        };
        if (currencyFormat) {
            if (currencyFormat != 'INR' || currencyFormat != '₹') return res.status(400).json({ status: false, message: `'${currencyFormat}' this currencyFormat invalid. Use 'INR' or '₹'.` });
            obj['currencyFormat'] = getSymbolFromCurrency('INR');
        };
        if (isFreeShipping) {
            if (!isBoolean(isFreeShipping)) return res.status(400).json({ status: false, message: 'isFreeShipping value should be boolean.' });
            obj['isFreeShipping'] = isFreeShipping;
        };
        if (style) {
            if (!isValidDes(style)) return res.status(400).json({ status: false, message: `'${style}' this style invalid. only string allowed.` });
            obj['style'] = style;
        };
        if (installments) {
            if (!Number(installments)) return res.status(400).json({ status: false, message: 'installments should be valid & number.' });
            obj['installments'] = installments;
        };

        if (availableSizes) {
            let sizeArray = availableSizes.toUpperCase().split(',').map(x => x.trim());
            for (let i = 0; i < sizeArray.length; i++) {
                if (!(['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'].includes(sizeArray[i]))) {
                    return res.status(400).json({ status: false, message: `Please enter size from available sizes ['S','XS','M','X','L','XXL','XL']` });
                }
            }
            obj['$addToSet'] = { availableSizes: sizeArray };
        };

        //existProduct
        const existProduct = await productModel.findById(productId)
        if (!existProduct) return res.status(404).json({ status: false, message: `Product not found by '${productId}' this productId.` });
        if (existProduct.isDeleted === true) return res.status(400).json({ status: false, message: "Product is already deleted" });

        if (title) {
            if (!isValidDes(title)) return res.status(400).json({ status: false, message: ` '${title}' this title invalid.` });
            const dupTitle = await productModel.findOne({ title });
            if (dupTitle) return res.status(400).json({ status: false, message: ` '${title}' this title is already exists.` });
            obj['title'] = title;
        };
        if (productImage) {
            if (!(file && file.length)) return res.status(400).json({ status: false, message: 'No file found.' });
            obj['productImage'] = await uploadFile(file[0]);
        };

        const savedData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, obj, { new: true });
        return res.status(200).json({ status: true, message: `'${Object.keys(obj)}'- updated successfully.`, data: savedData });
    }
    catch (err) {
        return res.status(500).json({ status: false, error: err.message });
    }
};


//deleteProduct
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        if (!isValidObjectId(productId)) return res.status(400).json({ status: false, message: ` '${productId}' this productId is invalid.` });

        const existProduct = await productModel.findById(productId)
        if (!existProduct) return res.status(404).json({ status: false, message: `Product does't exits.` });

        if (existProduct.isDeleted === true) return res.status(400).json({ status: false, message: ` '${existProduct.title}' this product already deleted.` });

        await productModel.findByIdAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: Date.now() });
        return res.status(200).json({ status: true, message: `'${existProduct.title}'- product successfully deleted.` });
    }
    catch (err) {
        return res.status(500).json({ status: false, error: err.message });
    }
};

module.exports = { createProduct, getProductByQuery, getProductById, updateProduct, deleteProduct };
