const express = require('express')
const router = express.Router()
const nlpController = require('./../controller/nlpController')

router.post('/naturallanguaugae', nlpController)

module.exports = router
