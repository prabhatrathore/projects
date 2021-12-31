const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const userModel = require('../models/userModel')
const bookModel = require('../models/booksModel')
const reviewModel = require('../models/reviewModel')

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
const createBook = async (req, res) => {
    try {
        let decodedUserToken = req.userId
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide book details' })
            return
        };
        if (!(decodedUserToken == requestBody.userId)) {
            return res.status(403).send({ Message: "you are trying to access a different's user account" })
        };
        // Extract params
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt, bookCover } = requestBody;
        // Validation starts
        if (!isValid(title)) {
            res.status(400).send({ status: false, message: ' Title is required' })
            return
        };
        const TitleinUse = await bookModel.findOne({ title })
        if (TitleinUse) {
            return res.status(400).send({ status: false, message: "Title is already registered." })
        };
        if (!isValid(excerpt)) {
            res.status(400).send({ status: false, message: ' excerpt is required' })
            return
        };
        if (!isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is not a valid userId` })
            return
        };
        const findUserId = await userModel.findById(userId);
        if (!findUserId) {
            return res.status(400).send({ status: false, message: 'Not a valid UserId' })
        }
        if (!isValid(ISBN)) {
            res.status(400).send({ status: false, message: 'ISBN is required' })
            return
        }
        const findISBN = await bookModel.findOne({ ISBN });
        if (findISBN) {
            return res.status(400).send({ status: false, message: 'Given ISBN is already present.' })
        }
        if (!isValid(category)) {
            res.status(400).send({ status: false, message: 'category is required' })
            return
        }
        if (!isValid(subcategory)) {
            res.status(400).send({ status: false, message: 'subcategory is required' })
            return
        };
        if (!(releasedAt)) {
            return res.status(400).send({ status: false, message: 'Release Date is required' })
        };
        if (!(/\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])/.test(releasedAt))) {
            res.status(400).send({ status: false, msg: "wrong format you provide" })
            return
        }
        // Validation ends       
        let Bookdata = { bookCover, title, excerpt, userId, ISBN, category, subcategory, releasedAt }
        let Book = await bookModel.create(Bookdata)
        res.status(201).send({ data: Book })
    } catch (error) {
        // console.log(error)
        res.status(500).send({ status: false, message: error.message });
    }
}
const getBooks = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false }
        let querybody = req.query;
        if (!isValidRequestBody(querybody)) {
            let NDeleted = await bookModel.find(filterQuery).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
            res.status(200).send({ status: true, message: 'Not Deleted Books List', data: NDeleted })
            return
        };
        const { userId, category, subcategory } = querybody

        if (isValid(userId) && isValidObjectId(userId)) {
            filterQuery['userId'] = userId
        };
        if (isValid(category)) {
            filterQuery['category'] = category.trim()
        };
        if (isValid(subcategory)) {
            filterQuery['subcategory'] = subcategory.trim()
        };
        let data = await bookModel.find(filterQuery).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1, subcategory: 1 }).sort({ title: +1 })
        //console.log(data)
        if (data) {
            return res.status(200).send({ status: true, msg: "books list", data: data })
        } else {
            res.status(400).send({ status: false, msg: "no book found " })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const bookById = async function (req, res) {
    try {
        const bookId = req.params.bookId

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        const book = await bookModel.findById({ _id: bookId, isDeleted: false });

        if (!book) {
            return res.status(404).send({ status: false, message: `Book does not exit` })
        }

        const reviews = await reviewModel.find({ bookId: bookId, isDeleted: false })

        const data = book.toObject()
        data['reviewsData'] = reviews

        return res.status(200).send({ status: true, message: 'Success', data: data })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

};

const updatebooks = async (req, res) => {
    try {
        let decodedUserToken = req.userId
        const requestBody = req.body;
        const bookId = req.params.bookId;

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }
        const book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: `Book not found` })
        }
        //Authorisation
        if (!(decodedUserToken == book.userId)) {
            return res.status(403).send({ Message: "you are trying to access a different's user account" })
        }
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'No paramateres passed. Book unmodified' })
        }    //Extract requestbody
        const { title, excerpt, releasedAt, ISBN } = requestBody;
        const upatedBookData = {}

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'A valid Title is required' })
        }
        const TitleinUse = await bookModel.findOne({ title })
        if (TitleinUse) {
            return res.status(400).send({ status: false, message: "Title is already registered." })
        }

        if (Object.prototype.hasOwnProperty.call(requestBody, 'title')) {
            upatedBookData.title = title.trim();
        }


        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: 'Excerpt is required' })
        }
        if (Object.prototype.hasOwnProperty.call(requestBody, 'excerpt')) {
            upatedBookData.excerpt = excerpt
        }


        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: 'released date is required' })
        }
        const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
        if (!regex.test(releasedAt)) {
            return res.status(400).send({ status: false, message: "Date format is not correct." })
        }
        if (Object.prototype.hasOwnProperty.call(requestBody, 'releasedAt')) {
            upatedBookData.releasedAt = releasedAt
        }

        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, message: 'ISBN is required' })
        };
        const findISBN = await bookModel.findOne({ ISBN });
        if (findISBN) {
            return res.status(400).send({ status: false, message: 'Given ISBN is already present.' })
        }
        if (Object.prototype.hasOwnProperty.call(requestBody, 'ISBN')) {
            upatedBookData.ISBN = ISBN
        }

        const upatedBook = await bookModel.findOneAndUpdate({ _id: bookId }, upatedBookData, { new: true })
        res.status(200).send({ status: true, message: 'Books updated successfully', data: upatedBook });

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
const deleteById = async function (req, res) {
    try {
        let decodeId = req.userId;
        let bookId = req.params.bookId;

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }       
        const book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: `Book not found` })
        }
        if (!(book.userId== decodeId)) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, message: `Success ${bookId} book deleted successfully` })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}
module.exports = { createBook, getBooks, bookById, updatebooks, deleteById }
