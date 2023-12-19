const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
    address: {
        type: String
    },
    blockHash: {
        type: String
    },
    blockNumber: {
        type: Number
    },
    transactionHash: {
        type: String
    },
    returnValues: {
        type: Object
    },
    event: {
        type: String
    },
    blockTimestamp: {
        type: Number
    },
}, {
    timestamps: true
})

const Events = mongoose.model('Events', eventsSchema);
module.exports = Events;