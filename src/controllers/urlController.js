const urlModel = require('../models/urlModel')
const shortid = require('shortid')
const validUrlData = require('valid-url')

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
};
const baseUrl = 'http:localhost:3000'
const createUrl = async function (req, res) {
    try {
        let requestBody = req.body;      //1
        // console.log(body)
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, msg: "provide  details" })
            return
        };

        const longUrl = req.body.longUrl;    //2

        function ValidURL(longUrl) {
            var regex = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if (!regex.test(longUrl)) {
                return false;
            } else {
                return true;
            }
        };
        if (longUrl.includes("w") && (longUrl.indexOf("w") === 6 || longUrl.indexOf("w") === 7 || longUrl.indexOf("w") === 8)) {
            let arr = [];
            let i = longUrl.indexOf("w");
            while (longUrl[i] == "w") {
                if (longUrl[i] === "w") { arr.push(longUrl[i]) };
                i++
            }
            if (!(arr.length === 3)) { return res.status(400).send({ status: false, msg: "Url is not valid " }) }
        }
        if (!(/(.com|.org|.co.in|.in|.co|.us)/.test(longUrl))) {
            return res.status(400).send({msg:"Url is not valid2"})
        }

        if (ValidURL(longUrl)) {
            let urlExist = await urlModel.findOne({ longUrl: longUrl });

            if (urlExist) {

                res.status(200).send({ status: true, data: urlExist })
            } else {
                const urlCode = shortid.generate().toLowerCase().replace(/[0-9]/g, '').replace(/[&\/\\#,+()$~%.-_-'":*?<>{}]/g, '');   //3

                const shortUrl = baseUrl + '/' + urlCode
                let urlOf = new urlModel({ longUrl, shortUrl, urlCode })
                let data = await urlModel.create(urlOf)
                res.status(200).send({ status: true, data: data })
            }
        } else {
            res.status(400).send({ status: false, msg: "not valid url" })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message });
    }
}
const getUrl = async function (req, res) {
    try {
        const url = await urlModel.findOne({ urlCode: req.params.code })
        console.log(url)
        if (url) {
            return res.redirect( url.longUrl);

        } else {
            return res.status(404).send({ msg: 'No URL Found' })
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.getUrl = getUrl
module.exports.createUrl = createUrl





