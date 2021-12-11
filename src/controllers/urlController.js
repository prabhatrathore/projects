const urlModel = require('../models/urlModel')
const shortid = require('shortid')

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
};

const isUrl= function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(str);
  };

const baseUrl = 'http:localhost:3000'
const createUrl = async function (req, res) {
    try {
        let body = req.body;
        // console.log(body)
        if (!isValidRequestBody(body)) {
            res.status(400).send({ status: false, msg: "provide  details" })
            return
        };

        const longUrl = req.body.longUrl;
        const urlCode = shortid.generate().toLowerCase().replace(/[0-9]/g, '').replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
        if (isUrl(longUrl)) {
            let urlExist = await urlModel.findOne({ longUrl:longUrl })
            if (urlExist) {
                res.status(200).send({ status: true, data: urlExist })
            } else {
                const shortUrl = baseUrl + '/' + urlCode
                let urlOf = new urlModel({ longUrl,shortUrl, urlCode, date: new Date() })
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
