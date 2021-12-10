const urlModel = require('../models/urlModel')
const shortid = require('shortid')

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidUrl = function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};
const baseUrl = 'http:localhost:3000'
const createUrl = async function (req, res) {
    try {
        let body = req.body;
        if (!isValidRequestBody(body)) {
            res.status(400).send({ status: false, msg: "provide  details" })
            return };

        const Url = req.body.longUrl;
        const urlCode = shortid.generate();

        if (isValidUrl(Url)) {
            let urlExist = await urlModel.findOne({ longUrl: Url })
            if (urlExist) {
                res.status(200).send({ status: true, data: urlExist })
            } else {
                const shortUrl = baseUrl + '/' + urlCode

                let urlOf = new urlModel({ longUrl, shortUrl, urlCode, date: new Date() })
                let data = await urlModel.create(urlOf)
                res.status(200).send({ status: true, data: data })
            }
        }else{
            res.status(400).send({status:false,msg:"not valid url"})
        }
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
const getUrl = async function (req, res) {
    try {
        const url = await urlModel.findOne({ urlCode: req.params.code })

        if (url) {
            return res.redirect(url.longUrl)

        } else {
            return res.status(404).json('No URL Found')
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.getUrl = getUrl
module.exports.createUrl = createUrl
