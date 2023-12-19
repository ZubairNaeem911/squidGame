const Series2NFT = require('../models/series2.model');
const EventSeries2 = require('../models/eventsSeries2.model')
const Config = require('../models/config.model');
const httpStatus = require('http-status')
const Web3 = require('web3');
const axios = require('axios');
const ethers = require("ethers");

// const ethers = require('ethers')

let { network_url, private_key, series1_address, series2_address } = require('../../config/vars')
let series1_Abi = require('../utils/Contracts/series1NftAbi.json')
let series2_Abi = require('../utils/Contracts/series2NftAbi.json')
// let series1Address = "0xF977025aEcB4b711C0Fde3EcB630b93c8Ff3a70C";

const nftCollections = [
    {       
        "contractName": "SeriesOne",
        "address": series1_address,
        "abi": series1_Abi,
        "startBlock": 13461638
    },
    {       
        "contractName": "SeriesTwo",
        "address": series2_address,
        "abi": series2_Abi,
        "startBlock": 15403531
    }
]


exports.getLatestEvents =  async(req,res) => {
try {
    const web3 = new Web3(new Web3.providers.HttpProvider(network_url));
    const contractAddress = nftCollections[0].address;
    const contract = new web3.eth.Contract(nftCollections[0].abi, contractAddress);

    contract.events.Transfer(options)
        .on('data', async (event) => {
            if (event) {
                // console.log(event, "event")
                    //UPDATE YOUR DB HERE
                }
            }
        )
} catch (error) {
    console.log(error)
}

}

exports.getNFTs = async (req, res) => {
    try {
        let walletAddress = req.body.walletAddress;
        let NftExisted = await Series2NFT.find({walletAddress : walletAddress})
        res.json({code:200, success: true, data: NftExisted})
        
    } catch (error) {
        res.json({code:400, success: false, error: error })
    }
} 


exports.storeEvents = async (req, res) => {
    try {

        const targetNft = 1;

        const web3 = new Web3(new Web3.providers.HttpProvider(network_url));
        const contractAddress = nftCollections[targetNft].address;
        const contract = new web3.eth.Contract(nftCollections[targetNft].abi, contractAddress);
        let latestNumber = await web3.eth.getBlockNumber();
        // console.log(latestNumber,  '============>>>>>')
        let startBlock;
        let eventsExisted = await Config.findOne({contractName : nftCollections[targetNft].contractName})
        if(eventsExisted){
            // console.log(eventsExisted)
            startBlock = eventsExisted.blockNumber
            await EventSeries2.deleteMany({blockNumber : startBlock})
        }
        else{
            startBlock = nftCollections[targetNft].startBlock
            eventsExisted = await Config.create({
                contractName : nftCollections[targetNft].contractName,
                blockNumber : startBlock
            })
        }

        for( let i = startBlock; i < latestNumber; i += 100) {
            
            let fromBlock = Number(i)
            let toBlock = fromBlock + 99;
            let eventsOfContract = []

            let events = await contract.getPastEvents('Transfer', {
                fromBlock,
                toBlock
            })

            // console.log(fromBlock, toBlock, events.length, "++++++++++++++++++++")
            for(let j = 0; j < events.length; j++){
                // console.log(events, "===>>>")
                const data = {
                    address : events[j].address.toLowerCase(),
                    blockHash: events[j].blockHash,
                    blockNumber: events[j].blockNumber,
                    transactionHash: events[j].transactionHash,
                    returnValues: events[j].returnValues,
                    event: events[j].event 
                }
                eventsOfContract.push(data);
            }
            if(eventsOfContract.length > 0){
                await EventSeries2.insertMany(eventsOfContract)
            }
            await eventsExisted.updateOne({ blockNumber: toBlock})
        }

        let tokenIds = await EventSeries2.aggregate([
            {
                $project: {
                    "tokenId": "$returnValues.tokenId",
                    "_id": 0
                }
            }
        ]);
        // console.log(tokenIds , "=============>>>")
        let tokenIdsOwner = []; 
        let ipfsJson = []
        for (const id of tokenIds){
            tokenIdsOwner = await contract.methods.ownerOf(id.tokenId).call();
            ipfsJson = await contract.methods.tokenURI(id.tokenId).call();
            let nftExisted = await Series2NFT.findOne({tokenId : id.tokenId })
            if(nftExisted){ 
                nftExisted.walletAddress = tokenIdsOwner;
                nftExisted.ipfsAddress = ipfsJson;
                nftExisted.tokenId = id.tokenId;
                await nftExisted.save();
            }
            else {
                const data = {
                    walletAddress : tokenIdsOwner,
                    ipfsAddress : ipfsJson,
                    tokenId : id.tokenId,
                    series : "seriesTwo"
                }
                await Series2NFT.create(data)
                res.status(httpStatus.CREATED)
            }           
            
        }
        return res.json({status: true, code: 200, message : 'Events fetched successfully'})

    } catch (error) {
        return res.json({success : false, code: 404, message : "Error happens while fething events"})
    }
}


exports.getMetaData = async (req, res) => {
    try {
        let ipfsMetaData = await Series2NFT.find({});

        let promises = [];
        ipfsMetaData.forEach( async (metaDataItem) => {
            promises.push(
                new Promise(async (resolve, reject) => {
                    try {
                        let url = `https://ipfs.io/${metaDataItem.ipfsAddress.replace(":","")}`;
                        let resDat = await axios.get(url)
                        let series2NftData = await Series2NFT.findOne({tokenId : metaDataItem.tokenId})
                        if(series2NftData){
                            series2NftData.metaData.ipfsImage = resDat.data.image;
                            series2NftData.metaData.name = resDat.data.name;
                        }
                        await series2NftData.save()
                        console.log('================================================')
                        console.log( resDat.data)
                        console.log('================================================')
                        resolve(series2NftData)
                    } catch (e) {
                        reject(e)
                    }
                })
            )
        })
        
        let promisesData = await Promise.all(promises)

        // res.json({code:200, success: true, data: promisesData})

    } catch (error) {
        console.log("error in api")
        
        // res.json({code:400, success: false, message: "error in api"})

    }

}

exports.generateIds = async (req, res) => {
    try {
      let usersData = await Series2NFT.find({});
      if(usersData.length > 0){
      usersData.forEach(async (data) => {
        const bufferArray = ethers.utils.solidityPack(
          ["address", "uint256", "uint8"],
          [data.walletAddress, data.tokenId, 2]
        );
        const messageHashBytes = ethers.utils.concat([bufferArray]);
        const playerID = ethers.utils.keccak256(messageHashBytes);
        data.playerId = playerID;
        console.log("USERS DATA>>>>>>", data, playerID);
  
           const updatedData = await data.save(); 
        console.log("USERS DATA>>>>>>", updatedData);
      });}
    } catch (error) {
      console.log("error in api",error);
    }
  };
  