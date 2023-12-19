const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    contractName: {
        type: String
    },
    blockNumber: {
        type: Number
    },
},
    {
        timestamps: true
    }
)

const ConfigSchema = mongoose.model('Config', configSchema);
module.exports = ConfigSchema;