const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const aws = require("aws-sdk");

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
};
const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss', 'Mast'].indexOf(title) !== -1
};
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};
const createUser = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' })
            return
        };// Extract params
        let { title, name, phone, email, password, address } = requestBody;// Object destructing
        //  Validation starts
        if (!isValid(title)) {
            res.status(400).send({ status: false, message: `Title is required1` })
            return
        };
        title = title.trim()
        if (!isValidTitle(title)) {
            res.status(400).send({status:false,message:`Title should be 'Mr', 'Mrs', 'Miss', ` })
            return
        };
        if (!isValid(name)) {
            res.status(400).send({ status: false, message: ' name is required' })
            return
        };
        if (!isValid(phone)) {
            res.status(400).send({ status: false, message: 'phone no is required' })
            return
        };
        phone = phone.trim()
        if (!(/^\(?([1-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone))) {
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
        };
        email = email.trim().toLowerCase()
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address 1` })
            return
        };
        const isEmailAlreadyUsed = await userModel.findOne({ email }); // {email: email} object shorthand property
        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email} email address is already registered` })
            return
        };
        if (!isValid(password)) {
            res.status(400).send({ status: false, message: `Password is required` })
            return
        };
        password = password.trim()
        if (!(password.length > 7 && password.length < 16)) {
            res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })
            return
        };
                 // Validation ends
        const userData = { title, name, phone, email, password, address };

        const newUser = await userModel.create(userData);
        res.status(201).send({ status: true, message: ` success`, data: newUser });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    };
};
const loginAuthor = async function (req, res) {
    try {
        const data = req.body;
       
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "provide login credentials" })
        };
        let  { email, password } = data
        if (!isValid(email)) {
            return res.status(401).send({ status: false, msg: "Email is required" })
        };
        email=email.toLowerCase().trim()
        if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({status: false, message: `Email should be a valid email address`})
            return
        };        
        if (!isValid(password)) {
            res.status(402).send({ status: false, msg: "password is required" })
            return
        };
        password=password.trim()
        if (!((password.length > 7) && (password.length < 16))) {
            return res.status(400).send({ status: false, message: `Password length should be between 8 and 15.` })
        };
        const user = await userModel.findOne({ email, password })
        if (!user) {
            res.status(403).send({ status: false, msg: "invalid email or password, try again with valid login credentials " })
            return
        };
        const token = await jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),//issue date
            exp: Math.floor(Date.now() / 1000) + 300000 * 60//expire date 30*60 = 30min 
        }, 'project4');
        res.header('x-api-key', token);
        res.status(200).send({ status: true, userId: user._id, token });
        return
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
        return
    };
};

module.exports = { createUser, loginAuthor }
