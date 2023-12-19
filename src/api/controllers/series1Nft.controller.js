const Series1NFT = require("../models/series1.model");
const Series2NFT = require("../models/series2.model");
const Event = require("../models/events.model");
const Config = require("../models/config.model");
const httpStatus = require("http-status");
const Web3 = require("web3");
const axios = require("axios");
const ethers = require("ethers");
let {
  network_url,
  private_key,
  series1_address,
  series2_address,
} = require("../../config/vars");
let series1_Abi = require("../utils/Contracts/series1NftAbi.json");
let seriesRough_Abi = require("../utils/Contracts/roughSeries1.json");
const series2_Abi = require("../utils/Contracts/series2NftAbi.json");
let series1Address = "0xF977025aEcB4b711C0Fde3EcB630b93c8Ff3a70C";

const nftCollections = [
  {
    contractName: "SeriesOne",
    address: series1_address,
    abi: series1_Abi,
    startBlock: 13461638,
  },
  {
    contractName: "SeriesTwo",
    address: series2_address,
    abi: series2_Abi,
    startBlock: 15403531,
  },
];

// exports.getAllNft = async (req, res) => {
//     try {
//         let tokenIds = await Event.aggregate([
//             {
//                 $project: {
//                   "tokenId": "$returnValues.tokenId",
//                   "_id": 0
//                 }
//               }
//         ]);
//         const targetNft = 0;

//         const web3 = new Web3(new Web3.providers.HttpProvider(network_url));
//         const contractAddress = nftCollections[targetNft].address;
//         const contract = new web3.eth.Contract(nftCollections[targetNft].abi, contractAddress);

//         let tokenIdsOwner = [];
//         let ipfsJson = []
//         for (const id of tokenIds){
//             tokenIdsOwner = await contract.methods.ownerOf(id.tokenId).call();
//             ipfsJson = await contract.methods.tokenURI(id.tokenId).call();
//             const data = {
//                 walletAddress : tokenIdsOwner,
//                 ipfsAddress : ipfsJson,
//                 tokenId : id.tokenId
//             }
//             await Series1NFT.create(data)
//             res.status(httpStatus.CREATED)
//         }

//         res.json({data : 'successfully saved all wallet address against ipfs'})
//     } catch (error) {
//         res.json({message : "System is not getting any response from Etherscan", code : 404})
//     }
// }
// exports.createNft = async (req,res) => {
//     try {
//         let data = req.body;
//         const creation = new Series1NFT(data);
//         const savedCreation = await creation.save();
//         res.status(httpStatus.CREATED)
//         res.json({code: 200, success: true, data: savedCreation })

//     } catch (error) {

//     }
// }

exports.getLatestEvents = async (req, res) => {
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(network_url));
    const contractAddress = "0xf93f15e8cFDEcbEfA45FDcb3A7e547Ba1AED9ADD";
    const contract = new web3.eth.Contract(seriesRough_Abi, contractAddress);
    console.log(contract, "contract");
    contract.events.Transfer(options).on("data", async (event) => {
      if (event) {
        console.log(event, "event");
        //UPDATE  DB HERE
      }
    });
    res.json({ code: 200, data: contract });
  } catch (error) {
    console.log(error);
  }
};

exports.
getNFTs = async (req, res) => {
  try {
    let walletAddress = req.body.walletAddress;
    let NftExistedForSeries1 = await Series1NFT.find({
      walletAddress: walletAddress,
    });
    let NftExistedForSeries2 = await Series2NFT.find({
      walletAddress: walletAddress,
    });
    NftExistedForSeries2.map((data) => NftExistedForSeries1.push(data));
    // let data = {
    //     NftExistedForSeries1 : NftExistedForSeries1,
    //     NftExistedForSeries2 : NftExistedForSeries2
    // }
    res.json({ code: 200, success: true, data: NftExistedForSeries1 });
  } catch (error) {
    res.json({ code: 400, success: false, error: error });
  }
};

exports.storeEvents = async (req, res) => {
  try {
    const targetNft = 0;

    const web3 = new Web3(new Web3.providers.HttpProvider(network_url));
    const contractAddress = nftCollections[targetNft].address;
    const contract = new web3.eth.Contract(
      nftCollections[targetNft].abi,
      contractAddress
    );
    let latestNumber = await web3.eth.getBlockNumber();
    // console.log(latestNumber, contract, contractAddress,  '============>>>>>')
    let startBlock;
    let eventsExisted = await Config.findOne({
      contractName: nftCollections[targetNft].contractName,
    });
    if (eventsExisted) {
      // console.log(eventsExisted)
      startBlock = eventsExisted.blockNumber;
      await Event.deleteMany({ blockNumber: startBlock });
    } else {
      startBlock = nftCollections[targetNft].startBlock;
      eventsExisted = await Config.create({
        contractName: nftCollections[targetNft].contractName,
        blockNumber: startBlock,
      });
    }

    for (let i = startBlock; i < latestNumber; i += 1000) {
      let fromBlock = Number(i);
      let toBlock = fromBlock + 999;
      let eventsOfContract = [];

      let events = await contract.getPastEvents("Transfer", {
        fromBlock,
        toBlock,
      });

      // console.log(fromBlock, toBlock)
      for (let j = 0; j < events.length; j++) {
        // console.log(events, "===>>>")
        const data = {
          address: events[j].address.toLowerCase(),
          blockHash: events[j].blockHash,
          blockNumber: events[j].blockNumber,
          transactionHash: events[j].transactionHash,
          returnValues: events[j].returnValues,
          event: events[j].event,
        };
        eventsOfContract.push(data);
      }
      if (eventsOfContract.length > 0) {
        await Event.insertMany(eventsOfContract);
      }
      await eventsExisted.updateOne({ blockNumber: toBlock });
    }

    let tokenIds = await Event.aggregate([
      {
        $project: {
          tokenId: "$returnValues.tokenId",
          _id: 0,
        },
      },
    ]);

    let tokenIdsOwner = [];
    let ipfsJson = [];
    for (const id of tokenIds) {
      tokenIdsOwner = await contract.methods.ownerOf(id.tokenId).call();
      ipfsJson = await contract.methods.tokenURI(id.tokenId).call();
      let nftExisted = await Series1NFT.findOne({ tokenId: id.tokenId });
      if (nftExisted) {
        nftExisted.walletAddress = tokenIdsOwner;
        nftExisted.ipfsAddress = ipfsJson;
        nftExisted.tokenId = id.tokenId;
        await nftExisted.save();
      } else {
        const data = {
          walletAddress: tokenIdsOwner,
          ipfsAddress: ipfsJson,
          tokenId: id.tokenId,
          series: "seriesOne",
        };
        await Series1NFT.create(data);
        res.status(httpStatus.CREATED);
      }
    }
    return res.json({
      status: true,
      code: 200,
      message: "Events fetched successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      code: 404,
      message: "Error happens while fething events",
    });
  }
};

// exports.getMetaData = async (req, res) => {
//   try {
//     let ipfsMetaData = await Series1NFT.find({});

//     let promises = [];

//     ipfsMetaData.forEach(async (metaDataItem) => {
//       promises.push(
//         new Promise(async (resolve, reject) => {
//           try {
//             let url = `https://ipfs.io/${metaDataItem.ipfsAddress.replace(
//               ":",
//               ""
//             )}`;
//             let resDat = await axios.get(url);
//             let series1NftData = await Series1NFT.findOne({
//               tokenId: metaDataItem.tokenId,
//             });
//             if (series1NftData) {
//               series1NftData.metaData.ipfsImage = resDat.data.image;
//               series1NftData.metaData.name = resDat.data.name;
//             }
//             await series1NftData.save();
//             console.log("================================================");
//             console.log(resDat.data);
//             console.log("================================================");
//             resolve(series1NftData);
//           } catch (e) {
//             reject(e);
//           }
//         })
//       );
//     });

//     let promisesData = await Promise.all(promises);

//     res.json({ code: 200, data: promisesData });
//   } catch (error) {
//     console.log("error in api");
//   }
// };

// exports.nftMetaData = async (req, res) => {
//   try {
//     let data = req.body;
//     let metaData;
//     if (data.series == "seriesOne") {
//       metaData = await Series1NFT.findOne({ tokenId: data.tokenId });
//     } else if (data.series == "seriesTwo") {
//       metaData = await Series2NFT.findOne({ tokenId: data.tokenId });
//     } else {
//       console.log("this is another series which is not available");
//     }
//     let obj = {};
//     let series = {};
//     series.series = metaData.series;
//     let tempObj = {};
//     obj.metaData = metaData.metaData;
//     tempObj = { ...obj.metaData, ...series };
//     console.log("META DATA??????",tempObj,data)
//     res.json({ code: 200, status: true, data: tempObj });
//   } catch (e) {
//     res.json({ code: 404, status: false, message: "MetaData is not existed" });
//   }
// };

exports.generateIds = async (req, res) => {
  try {
    let usersData = await Series1NFT.find({});
    if(usersData.length > 0){
    usersData.forEach(async (data) => {
      const bufferArray = ethers.utils.solidityPack(
        ["address", "uint256", "uint8"],
        [data.walletAddress, data.tokenId, 1]
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
