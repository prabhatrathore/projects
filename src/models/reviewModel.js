const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema({

    bookId: { type: ObjectId, required: false, ref: 'books' },
    reviewedBy: { type: String,required:false, default: "Guest" },

    reviewedAt: { type: Date, default: Date },
    rating: { type: Number, min: 1, max: 5, required: true, },//min:1,max:5},pattern: (1, 5)
    review: String,
    isDeleted :{type: Boolean, default:false   }
}, { timestamps: true })
module.exports = mongoose.model('review', reviewSchema,)