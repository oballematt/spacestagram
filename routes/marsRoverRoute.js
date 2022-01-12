const router = require('express').Router()
const roversController = require('../controllers/marsRover')

router.post('/images-by-camera', roversController.getImagesByCamera)

router.get('/images-default', roversController.getDefaultImages)

module.exports = router