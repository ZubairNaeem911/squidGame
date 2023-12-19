const express = require('express');
const controller = require('../../controllers/counter.controller')

const router = express.Router();

router
.route('/data')
.post(controller.createStage)

router
.route('/delete')
.post(controller.remove)

module.exports = router;