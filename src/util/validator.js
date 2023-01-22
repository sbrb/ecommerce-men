import mongoose from 'mongoose';

export const isValidBody = (data) => Object.keys(data).length > 0;
export const isValidName = (n) => (typeof n === 'string' && n.trim().length != 0 && n.match(/^[A-Z a-z]{2,}$/));
export const isValidEmail = (e) => /^([a-zA-Z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/.test(e);
export const isValidFile = (img) => /(\/*\.(?:png|gif|webp|jpeg|jpg))/.test(img);
export const isValidPass = (p) => /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(p);
export const isValidNumber = (ph) => /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(ph);
export const isValidAddress = (t) => /^(?=.*[A-Za-z,.-?%!&]+)[A-Za-z,.-?%!&\s0-9]{2,}$/.test(t);
export const isValidPin = (pin) => /^[1-9]{1}[0-9]{5}$/.test(pin);
export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
export const isValidPlainText = (pt) => typeof pt == 'string' && pt.trim().length != 0 && pt.match(/^[A-Z a-z 0-9,.-]{2,}$/);
export const isValidDescription = (d) => typeof d == 'string' && d.trim().length != 0 && d.match(/^[A-Z a-z 0-9,.-?%!&]{2,}$/);
export const isValidPrice = (v) => /^[1-9]\d{0,7}(?:\.\d{1,4})?$/.test(v);
export const isBoolean = (v) => v === true || v === false;
export const isValidIncludes = (v, bdy) => Object.keys(bdy).includes(v);
export const isValidDes = (d) => /^([a-z A-Z]{2,})?$/.test(d);
