const router = require('express').Router()
const apodController = require('../controllers/apod')

router.get('/apod', apodController.getRandomImages)

module.exports = router