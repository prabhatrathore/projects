const mongoose = require('mongoose')
const collegeModel = require('../models/collegeModel')


const createColleges = async function (req, res) {
    const isValid = function (value) {
        if (typeof value === 'undefined' || value === null) return false
        if (typeof value === 'string' && value.trim().length === 0) return false
        return true;
    }
    const isValidRequestBody = function (requestBody) {
        return Object.keys(requestBody).length > 0
    }
    const isAlpha = /^[a-zA-Z]*$/;
    
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide college details' })
            return
        }
        
        let temp = requestBody.name
        if (!isValid(temp)) {
            res.status(400).send({ status: false, message: 'Name is required' })
            return
        };
        let properspacing = temp.replace(/\s+/g, '')
        if (!(isAlpha.test(properspacing))) {
            res.status(400).send({ err: "Invalid request parameters-> Please provide valid college abbreviation. The abbreviation name should only contains alphabets. " })
            return
        };
        let Name = properspacing.toUpperCase()
        requestBody.name = Name
 
        const { name, fullName, logo } = requestBody;
        if (!isValid(logo)) {
            res.status(400).send({ status: false, message: 'logo is required' })
            return
        };
        if (!isValid(fullName)) {
            res.status(400).send({ status: false, message: 'fullName is required' })
            return
        };     
        let tempN = req.body.fullName;
        let tempname = tempN.replace(/_/g, ' ') // replacing all underscore with space
        const collegeData = {
            name: name, fullName: tempname, logo: logo
        };
        let data = await collegeModel.create(collegeData);
        res.status(201).send({ status: true, data: data })
    };
    catch (err) {
        res.status(500).send({ msg: err.message })
    };
};
module.exports.createColleges = createColleges;
