const express = require('express');
const controller = require('../../controllers/game.controller')
const router = express.Router();

router
.route('/existedNft')
.get(controller.getExistedNft)

router.route('/get/metadata')
.post(controller.nftMetaData)
module.exports = router;