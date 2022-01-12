const router = require('express').Router()
const roversController = require('../controllers/marsRover')

router.get('/images-by-camera', roversController.getImagesByCamera)

router.get('/images-default', roversController.getDefaultImages)

module.exports = router