require('dotenv').config();

let object = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    mongo: {
      uri: process.env.MONGO_URI,
    },
    network_url: process.env.NETWORK_URL,
    private_key: process.env.PRIVATE_KEY,
    series1_address: process.env.SERIES1_ADDRESS,
    series2_address: process.env.SERIES2_ADDRESS,
    startBlock : process.env.START_BLOCK,
    slotTime :  process.env.SLOT_TIME,
    gameAddress:process.env.GAME_CONTRACT_ADDRESS
  };
  
module.exports = object;