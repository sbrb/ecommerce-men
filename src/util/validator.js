const mongoose = require('mongoose');

const isValidBody = (data) => Object.keys(data).length > 0;
const isValidName = (n) => (typeof n === 'string' && n.trim().length != 0 && n.match(/^[A-Z a-z]{2,}$/));
const isValidEmail = (e) => /^([a-zA-Z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/.test(e);
const isValidFile = (img) => /(\/*\.(?:png|gif|webp|jpeg|jpg))/.test(img);
const isValidPass = (p) => /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(p);
const isValidNumber = (ph) => /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(ph);
const isValidAddress = (t) => /^(?=.*[A-Za-z,.-?%!&]+)[A-Za-z,.-?%!&\s0-9]{2,}$/.test(t);
const isValidPin = (pin) => /^[1-9]{1}[0-9]{5}$/.test(pin);
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const isValidPlainText = (pt) => typeof pt == 'string' && pt.trim().length != 0 && pt.match(/^[A-Z a-z 0-9,.-]{2,}$/);
const isValidDescription = (d) => typeof d == 'string' && d.trim().length != 0 && d.match(/^[A-Z a-z 0-9,.-?%!&]{2,}$/);
const isValidPrice = (v) => /^[1-9]\d{0,7}(?:\.\d{1,4})?$/.test(v);
const isBoolean = (v) => v === true || v === false;
const isValidIncludes = (v, bdy) => Object.keys(bdy).includes(v);
const isValidDes = (d) => /^([a-z A-Z]{2,})?$/.test(d);

module.exports = { isValidBody, isValidName, isValidEmail, isValidFile, isValidPass, isValidNumber, isValidPlainText, isValidDescription, isValidAddress, isValidPin, isValidObjectId, isValidPrice, isBoolean, isValidDes, isValidIncludes };
