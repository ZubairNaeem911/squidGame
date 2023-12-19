const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        default: "",
    },
    globalStage: {
        type: Number,
        default: 0
    },
    gameNumber: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});


const CounterSchema = mongoose.model('Counter', counterSchema);
module.exports = CounterSchema