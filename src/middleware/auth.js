import jwt from'jsonwebtoken';
import userModel from'../models/userModel.js';
import { isValidObjectId } from'../util/validator.js';

//authorization
export const authentication = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) return res.status(400).json({ status: false, message: `Please provide token.` });
        token = req.headers.authorization.slice(7);

        jwt.verify(token, process.env.KEY, (err, decoded) => {
            if (err) return res.status(401).json({ status: false, message: `Authentication Failed!`, error: err.message });
            req['user'] = decoded.userId;
            next();
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, error: err.message });
    }
};

//authorization
export const authorization = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ status: false, message: `userId is required.` });
        if (!isValidObjectId(userId)) return res.status(400).json({ status: false, message: ` '${userId}' this userId invalid.` });

        const existUser = await userModel.findById(userId);
        if (!existUser) return res.status(404).json({ status: false, message: `User not found by '${userId}' this userId.` });

        if (req.user != userId)
            return res.status(403).json({ status: false, message: ` '${existUser.fname} ${existUser.lname}' you are unauthorized.` });
        next();
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, error: err.message });
    }
};
