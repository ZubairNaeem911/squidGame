const mongoose = require('mongoose');

const series1Schema = new mongoose.Schema({
    walletAddress: {
        type: String,
        default: ""
    },
    ipfsAddress: {
        type: String,
        default: ""
    },
    tokenId: {
        type: Number,
        default: ""
    },
    series: {
        type: String,
        default: ""
    },
    playerId:{
        type: String,
        default: "",
    },
    metaData: {
        ipfsImage: {
            type: String,
            default: ""
        },
        name: {
            type: String,
            default: ""
        }
    }
},
    {
        timestamps: true
    })

const Series1 = mongoose.model('Series1_NFT', series1Schema);
module.exports = Series1