const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    title: {
        type: String,required: 'title is necessary', enum: ['Mr', 'Mrs', 'Miss', 'Mast'],
         trim: true
    },
    name: { type: String, required: ' Name is required1', trim: true },
    phone: {
        type: Number, required: 'phone number is required1', unique: true, trim: true,
       
    },
    password: {
        type: String, required: 'Password is required',
        minlength: 8, maxlength: 15, trim: true,
    },
    address: { street: String, city: String, pincode: Number },
    email: {
        type: String, trim: true, lowercase: true, unique: true,
        required: 'Email address is necessary',
      
    },
}, { timestamps: true })
module.exports = mongoose.model('user', userSchema,)