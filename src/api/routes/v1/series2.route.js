const express = require('express');
const controller = require('../../controllers/series2Nft.controller')

const router = express.Router();

router
.route('/store/nft')
.get(controller.storeEvents)

router
.route('/event')
.get(controller.getLatestEvents)

router.route('/get/nft')
.post(controller.getNFTs)

router.route('/get/metadata')
.get(controller.getMetaData)

// router.route('/get/latest/nft')
// .get(controller.getLatestNFT)

module.exports = router;
