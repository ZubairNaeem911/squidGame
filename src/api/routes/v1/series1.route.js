const express = require('express');
const controller = require('../../controllers/series1Nft.controller')


const router = express.Router();

router
.route('/store/nft')
.get(controller.storeEvents)

router
.route('/event')
.get(controller.getLatestEvents)

router.route('/get/nft')
.post(controller.getNFTs)

// router.route('/get/metadata')
// .post(controller.nftMetaData)

module.exports = router;
