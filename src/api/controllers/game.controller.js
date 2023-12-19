const GameAbi = require("../utils/Contracts/gameAbi.json");
let { gameAddress } = require("../../config/vars");
const Series1NFT = require("../models/series1.model");
const Series2NFT = require("../models/series2.model");
const ethers = require("ethers");
exports.getExistedNft = async (req, res) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://avalanche-fuji-c-chain.publicnode.com"
    );
    const contract = new ethers.Contract(gameAddress, GameAbi, provider);

    // let walletAddress = req.body.walletAddress;
    const walletAddress = req.query.walletAddress;

    let NftExistedForSeries1 = await Series1NFT.find({
      walletAddress: walletAddress,
    });


    let NftExistedForSeries2 = await Series2NFT.find({
      walletAddress: walletAddress,
    });

    let wholeArrayData = [...NftExistedForSeries1, ...NftExistedForSeries2];

    let formattedData = [];
    wholeArrayData.map(async (data) => {
      let temp = { ...data }._doc;
      temp.ipfsAddress =
        process.env.IPFS_URL + data.ipfsAddress.replace(":/", "");
      if (data.series == "seriesTwo") {
        temp.image = data.metaData.ipfsImage;
      }
      if (data.series == "seriesOne") {
        temp.image =
          process.env.IPFS_URL + data.metaData.ipfsImage.replace(":/", "");
      }
      temp.name = data.metaData.name;
      temp.nftId = data.tokenId;
      formattedData.push(data);
    });
    const isExistedArray = await isExistedPromise(formattedData, contract);

    console.log("TEST DATA>>>>>>", isExistedArray.length);

    isExistedArray.map((test)=>{
      if(test.status === false){
      }
    })
    const result = isExistedArray.filter((nft) => nft.status == true);
    console.log("TEST DATA>>>>>>", result.length,walletAddress);

    res.json({ code: 200, success: true, data: result });

  } catch (error) {
    console.log("TEST DATA>>>>>>", error);
  }
};

const isExistedPromise = async (idArray, contractInstance) => {
  try {
    return new Promise(async function (resolve1, reject1) {
      let promises = [];
      for (let i = 0; i < idArray?.length; i++) {
        promises.push(
          new Promise((resolve, reject) => {
            contractInstance
              .isExist(idArray[i].playerId)
              .then((res) => {
                console.log("TEST DATA>>>>>>", res,idArray[i].playerId);

                resolve({
                  ...idArray[i]._doc,
                  status: res,
                });
              })
              .catch((e) => {
                reject(e);
              });
          })
        );
      }
      Promise.all(promises).then((x) => {
        resolve1(x);
      });
    });
  } catch (error) {
    console.log("TEST DATA>>>>>>", error);
  }
};

exports.nftMetaData = async (req, res) => {
  try {
    let data = req.body;
    console.log("META DATA??????",data)

    let metaData;
    if (data.series == "seriesOne") {
      metaData = await Series1NFT.findOne({ tokenId: data.tokenId });
    } else if (data.series == "seriesTwo") {
      metaData = await Series2NFT.findOne({ tokenId: data.tokenId });
    } else {
      console.log("this is another series which is not available");
    }
    let obj = {};
    let series = {};
    series.series = metaData.series;
    let tempObj = {};
    obj.metaData = metaData.metaData;
    tempObj = { ...obj.metaData, ...series };
   
    let imageUrl;
    if (data.series == "seriesOne") {
      imageUrl =
        process.env.IPFS_URL +
        tempObj.ipfsImage.replace(":/", "");
    } else {
      imageUrl = tempObj.ipfsImage
        ? tempObj.ipfsImage
        : "";
    }
    console.log("META DATA??????",tempObj,imageUrl)
    let resObj = {
      imageUrl,
      name:tempObj.name,
    }
    res.json({ code: 200, status: true, data: resObj });
  } catch (e) {
    console.log(e);
    res.json({ code: 404, status: false, message: "MetaData is not existed" });
  }
};
