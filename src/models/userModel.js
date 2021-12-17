const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    title: {
        type: String, enum: ['Mr', 'Mrs', 'Miss', 'Mast'],
        required: 'Title is required',
    },
    name: { type: String, required: ' name is required', trim: true, },
    phone: {
        type: Number, required: 'phone number is required', unique: true, trim: true,
        validate: {
            validator: function (phone) {
                return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone);
                // console.log(regex.test(phone))
            }, message: 'Please fill a valid phone number'
        }
    },
    password: {
        type: String,
        required: 'Password is required', minlength: 8, maxlength: 15, trim: true,
    },
    address: {
        street: String, city: String, pincode: Number
    },
    email: {
        type: String, trim: true, lowercase: true, unique: true,
        required: 'Email address is required',
        validate: {
            validator: function (email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
            }, message: 'Please fill a valid email address', isAsync: false
        }
    },

}, { timestamps: true })

module.exports = mongoose.model('user', userSchema,)