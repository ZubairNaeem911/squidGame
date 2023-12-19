const mongoose = require('mongoose');

const series2Schema = new mongoose.Schema({
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

const Series2 = mongoose.model('Series2_NFT', series2Schema);
module.exports = Series2