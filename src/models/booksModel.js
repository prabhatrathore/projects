const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const bookSchema = new mongoose.Schema({
    title: { type: String, required: " title is necessary", trim: true, unique: true },

    excerpt: { type: String, required: 'excerpt is necessary', trim: true },
    userId: { required: 'user is required', type: ObjectId, ref: 'user' },
    ISBN: { type: Number, required: true, unique: true },

    category: { type: String, trim: true, required: ' category is necessary' },
    subcategory: { type: String, trim: true, required: 'subCategory is necessary' },

    reviews: { type: Number, default: 0, },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    releasedAt: { type: Date, required:true,default: null },

}, { timestamps: true })
module.exports = mongoose.model('books', bookSchema,)