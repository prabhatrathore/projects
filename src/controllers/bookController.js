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
    return mongoose.Types.ObjectId.isValid(objectId)
};
const createBook = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide book details' })
            return
        }        // Extract params
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = requestBody;
        // Validation starts
        if (!isValid(title)) {
            res.status(400).send({ status: false, message: ' Title is required' })
            return
        }
        if (!isValid(excerpt)) {
            res.status(400).send({ status: false, message: ' excerpt is required' })
            return
        }
       
        if (!isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is not a valid userId` })
            return
        };
        if (!isValid(ISBN)) {
            res.status(400).send({ status: false, message: 'ISBN is required' })
            return
        }
        if (!isValid(category)) {
            res.status(400).send({ status: false, message: 'category is required' })
            return
        }

        if (!isValid(subcategory)) {
            res.status(400).send({ status: false, message: 'subcategory is required' })
            return
        };
        if (!isValid(releasedAt)) {
            res.status(400).send({ status: false, message: 'releasedAt is required' })
            return
        };
        const user = await userModel.findOne({ _id: userId });
        if (!user) {
            res.status(400).send({ status: false, message: `user is not exit in database` })
            return
        }; // Validation ends
        const bookData = { title, excerpt, userId, category, subcategory, ISBN,
            releasedAt
        };     
        let id = req.body.userId;
        let decodeId = req.userId;
        if (decodeId == id) {
            let userData1 = await userModel.findOne({ _id: id })
            if (userData1) {
                let dataOf = await bookModel.create(bookData);
                res.status(201).send({ status: true, data: dataOf })
            }
        }
        else {
            res.status(403).send({ status: false, msg: 'authorisation failed1' })
        }
    } catch (error) {
        // console.log(error)
        res.status(500).send({ status: false, message: error.message });
    }
}
const getBooks = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false }
        let querybody = req.query;

        if(isValidRequestBody(querybody)) {
            const {userId, category, subcategory} = querybody

            if(isValid(userId) && isValidObjectId(userId)) {
                filterQuery['userId'] = userId            
        };
            if(isValid(category)) {
                filterQuery['category'] = category.trim()
            };                  
            if(isValid(subcategory)) {
               
                filterQuery['subcategory'] = subcategory // {$all: subcatArr}   
               }    
            }      
        let data = await bookModel.find(filterQuery).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1,subcategory:1 }).sort({ title: +1 })
        //console.log(data)
       if (data) {
           return res.status(200).send({ status: true,msg:"books list",data: data })
       }  else {
                res.status(400).send({ status: false, msg: "no book found " })
          }  
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
const bookById = async function (req, res) {
    try {
        let book = req.params.bookId;
        let data = await bookModel.findOne({ _id: book, isDeleted: false });
        //  console.log(data)
        if (!data) {
            res.status(400).send({ status: false, msg: "no book found or may be deleted" })
            return
        };
        const reviewData = await reviewModel.find({ bookId: book, isDeleted: false })
        //console.log(reviewData)
        const dataOf = { data, reviewData }
        res.status(200).send({ status: true, msg:"books list ",data: dataOf })
        return
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
};
const updateBook = async function (req, res) {
    try {
        let decodeId = req.userId;
        let bookId = req.params.bookId;
        let bookData = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!bookData) {
            return res.status(404).send({ status: false, msg: 'invalid book id or may be this book is deleted' })
        };
        let userId = bookData.userId;
        if (decodeId == userId) {
            let updatedValue = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, {
                $set: {
                    title: req.body.title,
                    excerpt: req.body.excerpt,
                    category: req.body.category,
                    ISBN: req.body.ISBN,
                    updatedAt: Date.now()
                },
            }, { new: true })
            res.status(200).send({ status: true, data: updatedValue });
        }else {
            res.status(400).send({status:false, msg:'authorisation failed, not valid user'})
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}
const deleteById = async function (req, res) {
    try {
        let decodeId = req.userId;
        let bookId = req.params.bookId;

        let bookUser = await bookModel.findOne({ _id: bookId });
        if (!bookUser) {
            return res.status(400).send({ status: false, msg: 'invalid book id' })
        };
        let userId = bookUser.userId;
        if (decodeId == userId) {
            // let id = req.params.bookId;
            let data = await bookModel.findOne({ _id: bookId, isDeleted: false })
            if (data) {
                let deleteData = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
                res.status(200).send({ status: true, deletedAt: Date() })
            } else {
                res.status(400).send({ status: false, msg: "invalid input of id or the document is already delete" })
            }
        } else {
            res.status(400).send({ status: false, msg: "invalid user or token id" })
        }
    }
    catch (err) {
        res.status(400).send({ msg: err.message })
    }
}

module.exports = { createBook, getBooks, bookById, updateBook, deleteById }
