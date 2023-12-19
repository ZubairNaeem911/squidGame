const express = require('express');
const controller = require('../../controllers/gameEnd.controller')

const router = express.Router();

router
.route('/')
.post(controller.create)


router
.route('/get')
.post(controller.getGameEndFlag)

module.exports = router;