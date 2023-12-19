exports.getMetaData = async (req, res) => {
    try {
        let ipfsMetaData = await Series1NFT.find({});

        let promises = [];

        ipfsMetaData.forEach( async (metaDataItem) => {
            promises.push(
                new Promise(async (resolve, reject) => {
                    try {
                        let url = `https://ipfs.io/${metaDataItem.ipfsAddress.replace(":","")}`
                        let resDat = await axios.get(url)
                        let series1NftData = await Series1NFT.findOne({tokenId : metaDataItem.tokenId})
                        if(series1NftData){
                            series1NftData.metaData.ipfsImage = resDat.data.image;
                            series1NftData.metaData.name = resDat.data.name;
                        }
                        await series1NftData.save()
                        console.log('================================================')
                        console.log( resDat.data)
                        console.log('================================================')
                        resolve(series1NftData)
                    } catch (e) {
                        reject(e)
                    }
                })
            )
        })
        
        let promisesData = await Promise.all(promises)

        res.json({code:200, data: promisesData})

    } catch (error) {
        console.log("error in api")
    }

}