const express = require('express');
const router = express.Router();
const aws = require("aws-sdk");

const userController = require('../controllers/userController');
const bookController = require('../controllers/bookController')
const userAuth = require('../middlewares/userAuth')
const reviewController = require('../controllers/reviewController')
// user routes
router.post('/register', userController.createUser);
router.post('/login', userController.loginAuthor);
// Blog routes
router.post('/books', userAuth, bookController.createBook);
router.get('/books', userAuth, bookController.getBooks);
router.get('/book/:bookId', userAuth, bookController.bookById);
router.put('/books/:bookId', userAuth, bookController.updatebooks);
router.delete('/books/:bookId', userAuth, bookController.deleteById);
//review
router.post('/books/:bookId/review', reviewController.review);
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview);
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview);

//book cover
aws.config.update({
    accessKeyId: "AKIAY3L35MCRRMC6253G",  // id
    secretAccessKey: "88NOFLHQrap/1G2LqUy9YkFbFRe/GNERsCyKvTZA",  // like your secret password
    region: "ap-south-1" // Mumbai region
});
// this function uploads file to AWS and gives back the url for the file
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) { // exactly       
        // Create S3 service object
        let s3 = new aws.S3({ apiVersion: "2006-03-01" });
        var uploadParams = {
            ACL: "public-read", // this file is publically readable
            Bucket: "classroom-training-bucket", // HERE
            Key: "pk_newFolder/" + file.originalname, // HERE    "pk_newFolder/harry-potter.png" pk_newFolder/harry-potter.png
            Body: file.buffer,
        };
        // Callback - function provided as the second parameter ( most oftenly)
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err });
            }
            console.log(data)
            console.log(`File uploaded successfully. ${data.Location}`);
            return resolve(data.Location); //HERE 
        });
    });
};

router.post("/write-file-aws", async function (req, res) {
    try {
        let files = req.files;
        if (files && files.length > 0) {
            //upload to s3 and return true..incase of error in uploading this will goto catch block( as rejected promise)
            let uploadedFileURL = await uploadFile(files[0]); // expect this function to take file as input and give url of uploaded file as output 
            res.status(201).send({ status: true, data: uploadedFileURL });
        }
        else {
            res.status(400).send({ status: false, msg: "No file to write" });
        }  }
    catch (e) {
        console.log("error is: ", e);
        res.status(500).send({ status: false, msg: "Error in uploading file to s3" });
    }
}  );
module.exports = router;