const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const bookSchema = new mongoose.Schema({
    title: { type: String, required: ' title is required', trim: true, unique: true },

    excerpt: { type: String, required: 'excerpt is required', trim: true },
    userId: { required: 'user is required', type: ObjectId, ref: 'user' },
    ISBN: { type: Number, required: true, unique: true },

    category: { type: String, trim: true, required: ' category is required' },
    subcategory: { type: String, trim: true, required: 'subCategory is required' },

    reviews: { type: Number, default: 0 ,},
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    releasedAt: { type: Date, default: null },
  
}, { timestamps: true })
module.exports = mongoose.model('books', bookSchema,)