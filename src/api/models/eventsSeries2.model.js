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

const EventSeries2 = mongoose.model('EventSeries2', eventsSchema);
module.exports = EventSeries2;