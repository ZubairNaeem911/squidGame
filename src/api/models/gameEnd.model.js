const mongoose = require('mongoose');


const gameEnd = new mongoose.Schema({
    walletAddress: {
        type: String,
        default: "",
        unique: true
    },
    gameEnd: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
)
const GameEnd = mongoose.model('Game_End', gameEnd)
module.exports = GameEnd