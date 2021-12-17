const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
}
const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss', 'Mast'].indexOf(title) !== -1
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}
const createUser = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' })
            return
        } // Extract params
        const { title, name, phone, email, password, address } = requestBody; // Object destructing
        // Validation starts
        if (!isValidTitle(title)) {
            res.status(400).send({ status: false, message: `Title should be among Mr, Mrs, Miss and Mast` })
            return
        }
        if (!isValid(name)) {
            res.status(400).send({ status: false, message: ' name is required' })
            return
        }
        if (!isValid(phone)) {
            res.status(400).send({ status: false, message: 'phone is required' })
            return
        };
        if (!(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone))) {
            res.status(400).send({ status: false, message: `Please fill a valid phone number` })
            return
        };
        const isPhoneAlreadyUsed = await userModel.findOne({ phone }); //{phone: phone} object shorthand property

        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: `${phone} phone number is already registered` })
            return
        };
        if (!isValid(email)) {
            res.status(400).send({ status: false, message: `Email is required` })
            return
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address 1` })
            return
        }
        if (!isValid(password)) {
            res.status(400).send({ status: false, message: `Password is required` })
            return
        }
        if (!(password.length > 8 && password.length < 15)) {
            res.status(400).send({ status: false, message: "password should  between 8and 15 characters" })
            return
        };
        const isEmailAlreadyUsed = await userModel.findOne({ email }); // {email: email} object shorthand property
        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email} email address is already registered` })
            return
        };          // Validation ends
        const userData = { title, name, phone, email, password, address }
       
        const newUser = await userModel.create(userData);
        res.status(201).send({ status: true, message: ` success`, data: newUser });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    };
};
const loginAuthor = async function (req, res) {
    try {
        const data = req.body;
        //  console.log(data)
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "provide login credentials" })
        };
        const { email, password } = data
        if (!email) {
            return res.status(401).send({ status: false, msg: "Email is required" })
        };
        if (!password) {
            res.status(402).send({ status: false, msg: "password is required" })
            return
        };
        const user = await userModel.findOne({ email, password })
        if (!user) {
            res.status(403).send({ status: false, msg: "invalid login credentials" })
            return
        };
        const token = await jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),//issue date
            exp: Math.floor(Date.now() / 1000) + 30 * 60//expire date 30*60 = 30min 
        }, 'project4');
        res.header('x-api-key', token);
        res.status(200).send({ status: true, data: user._id, token });
        return
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
        return
    };
};
module.exports = { createUser, loginAuthor }
