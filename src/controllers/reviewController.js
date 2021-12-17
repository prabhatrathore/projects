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
    return mongoose.Types.ObjectId.isValid(objectId)
};
const review = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        const requestBody = req.body;
        let bookExist = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!bookExist) {
            res.status(400).send({ status: false, msg: "book doesn't exist or may be deleted " })
            return
        }
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide review details' })
            return
        };        // Extract params
        const { reviewedBy, reviewedAt, rating, isDeleted } = requestBody;
        // Validation starts
        if (!isValid(bookId)) {
            res.status(400).send({ status: false, message: ' bookId is required' })
            return
        };
        if (!isValid(rating)) {
            res.status(400).send({ status: false, message: 'rating is required' })
            return
        };
        if (!(rating >= 1 && rating <= 5)) {
            res.status(400).send({ status: false, message: "rating should  between 1 and 5 number " })
            return
        };
        const reviewData = { bookId, reviewedBy, reviewedAt, rating, isDeleted };
        const newReview = await reviewModel.create(reviewData)

        await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { 'reviews': 1 } }, { new: true })
        res.status(200).send({ status: true, message: ` success`, data: newReview });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message });
    };
};
const updateReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let bookIdExist = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!bookIdExist) {
            return res.status(400).send({ status: false, msg: "bookId is not valid or may be deleted" })
        };
        let reviewIdExist = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!reviewIdExist) {
            return res.status(400).send({ status: false, msg: "reviewId is not valid" })
        };
        const requestBody = req.body
        const { reviewedBy, review, reviewedAt, rating, isDeleted } = requestBody;
        //  if (!isValid(reviewedBy)) {
        //    res.status(400).send({ status: false, message: ' reviewedBy is required' })
        //  return        //};
        if (!isValid(rating)) {
            res.status(400).send({ status: false, message: 'rating is required' })
            return
        };
        if (!(rating >= 1 && rating <= 5)) {
            res.status(400).send({ status: false, message: "rating should  between 1 and 5 number " })
            return
        };
        const updateReviewData = { bookId, reviewedBy, review, reviewedAt, rating, isDeleted };
        //  console.log(updateReviewData)
        const newReview = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false },
            updateReviewData, { new: true })
        // console.log(newReview)
        res.status(200).send({ status: true, message: ` success`, data: newReview });
    } catch (error) {
        // console.log(error)
        res.status(500).send({ status: false, message: error.message });
    };
};

const deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId
        let bookIdExist = await bookModel.findOne({ _id: bookId, isDeleted: false })
//console.log(bookIdExist)
        if (!bookIdExist) {
            return res.status(400).send({ status: false, msg: "bookId is invalid or may be deleted" })
        };
        let reviewIdExist = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
      //  console.log(reviewIdExist)
        if (!reviewIdExist) {
            return res.status(400).send({ status: false, msg: "reviewId is not valid or may be deleted" })
        };
        let deletedData = await reviewModel.findOneAndUpdate({ _id: reviewId },
            { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

        await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { 'reviews': -1 } }, { new: true })

       if (deletedData) {
            return res.status(200).send({status:true,data:`${reviewId} is deleted successfully` });
        }
    }
    catch (err) {
        return res.status(500).send({ status: false,msg:err.message })
    }
}

module.exports = { review, updateReview, deleteReview }