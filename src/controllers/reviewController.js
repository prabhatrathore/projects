const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/booksModel')

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
};
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
};
const isValidObjectId = function (objectId) {
    return ObjectId.isValid(objectId)
};
const review = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        const requestbody = req.body;

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: 'Invalid Book Id' })
        }
        const BookExist = await bookModel.findById({ _id: bookId, isDeleted: false })
        if (!BookExist) {
            return res.status(400).send({ status: false, message: "Either bookId is not present in DB or book is deleted" })
        }
        if (!isValidRequestBody(requestbody)) {
            return res.status(400).send({ status: false, message: 'Please provide details in request body' })
        }
        const { reviewedBy, rating, reviews, isDeleted } = requestbody;

        if (!isValid(rating)) {
            return res.status(400).send({ status: false, message: `Rating is required` })
        }
        if (!((rating > 0) && (rating < 6))) {
            return res.status(400).send({ status: false, message: `Rating  should be between 1 and 5.` })
        }
        let ReviewDetails = { bookId, reviewedBy, rating, reviews, isDeleted }

        const DataInsertedForReview = await reviewModel.create(ReviewDetails)
        await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { 'reviews': 1 } }, { new: true })
        res.status(200).send({ status: true, msg: "success", data: DataInsertedForReview })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};
const updateReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: 'Invalid Book Id' })
        };

        let bookIdExist = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!bookIdExist) {
            return res.status(400).send({ status: false, msg: "book not found  or  deleted" })
        };
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: 'Invalid reviewId' })
        };
        let reviewIdExist = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!reviewIdExist) {
            return res.status(400).send({ status: false, msg: "reviewId not found or  deleted" })
        };
        let validReviewer = bookId == reviewIdExist.bookId
        if (!validReviewer) {
            return res.status(400).send({ status: false, msg: " reviewer info with this bookId is not match" })
        }
        const requestBody = req.body
        const { reviewedBy, review, reviewedAt, rating, isDeleted } = requestBody;

        if (!isValid(rating)) {
            res.status(400).send({ status: false, message: 'rating is required' })
            return
        };
        if (!(rating >= 1 && rating <= 5)) {
            res.status(400).send({ status: false, message: "rating should  between 1 and 5 number " })
            return
        };
        const updateReviewData = { bookId, reviewedBy, review, reviewedAt, rating, isDeleted };

        const newReview = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false },
            updateReviewData, { new: true })

        res.status(200).send({ status: true, message: ` success`, data: newReview });
    } catch (error) {

        res.status(500).send({ status: false, message: error.message });
    };
};

const deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: 'Invalid Book Id' })
        };

        let bookIdExist = await bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!bookIdExist) {
            return res.status(400).send({ status: false, msg: "bookId not found or  deleted" })
        };
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: 'Invalid reviewId' })
        };
        let reviewIdExist = await reviewModel.findOne({ _id: reviewId, isDeleted: false })

        if (!reviewIdExist) {
            return res.status(400).send({ status: false, msg: "reviewId not found or  deleted" })
        };
        let validReviewer = bookId == reviewIdExist.bookId

        if (!validReviewer) {
            return res.status(400).send({ status: false, msg: "reviewer info with this bookId is not match" })
        };
        let deletedData = await reviewModel.findOneAndUpdate({ _id: reviewId },
            { isDeleted: true, deletedAt: Date.now() }, { new: true })

        await bookModel.findOneAndUpdate({ _id: bookId }, { 'reviews': -1 }, { new: true })
        if (deletedData) {
            return res.status(200).send({ status: true, msg: `your review Id ${reviewId}is deleted successfully` });
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports = { review, updateReview, deleteReview }