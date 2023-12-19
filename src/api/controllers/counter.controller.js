const Counter = require('../models/counter.model')
const httpStatus = require('http-status')
let {slotTime} = require('../../config/vars');
const { findOneAndDelete } = require('../models/counter.model');

exports.create = async (req, res) => {
    try {
        let data = req.body;
        // let counterPrevData = {
        //     walletAddress : "0x3F5363ef635ffa0a65A0d364cE638f1BE2aDceB2",
        //     date: 1684749978
        // };
        let counterPrevData = await Counter.findOne({walletAddress: data.walletAddress});

        let nextSlotTime;
        if(counterPrevData != null){
            console.log(parseInt(counterPrevData.date), parseInt(data.remainingTime), "prevcounter + remain")

            nextSlotTime = parseInt(counterPrevData.date) + parseInt(data.remainingTime)    
             console.log(nextSlotTime, "total time")
        
        if(data.walletAddress == counterPrevData.walletAddress){    
            console.log(data.date, nextSlotTime , "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
            
            if( (data.date) >= nextSlotTime ){
                console.log(data.date, nextSlotTime , data.date - nextSlotTime, "now time or total time", "date and prev date difference");
                // if(counterPrevData){
                    counterPrevData.date = data.date
                    await counterPrevData.save()
                // } 
                res.json({code:200, success: true, data: counterPrevData})
            } 
            else{
                // console.log("========>>>>>")
                res.json({code : 400, message: "you have enter less than one day before your turn "})
            }
        }
    }
        else{
            let counterData = new Counter(data)
            const savedCounter = await counterData.save()
            // console.log(savedCounter, "hhhehehehehehhehehehehehehe")
            res.status(httpStatus.CREATED);
            res.json({code:200, success: true, data: savedCounter})
        }
       

    } catch (error) {
        res.json({code:400, success: false, message: "error in counter POST API"})
    }
}



exports.createStage = async (req, res) => {
    try {
        let data = req.body;
        let newStage = await Counter.findOne({
            $and : [
                {
                    walletAddress: data.walletAddress
                },
                {
                    globalStage: data.globalStage
                },
                {
                    gameNumber: data.gameNumber
                }
            ]
                    
        });
        // console.log(newStage,"newwwwwwwwwww")
        if (newStage !== null) {
            res.json({ code: 200, success: false, message: "data is already available", data: newStage })
        }
        else {
            let latestStage = new Counter(data);
            let savedStage = await latestStage.save();
            res.status(httpStatus.CREATED);
            res.json({ code: 200, success: true, message: "data created", data: savedStage })            
        }


    } catch (error) {
        res.json({code:400, success: false, message: "error in counter POST API" , error: error.message})
        
    }
}

exports.remove = async (req, res) => {
    try {
        let data = req.body;
        await Counter.deleteMany({ gameNumber: data.gameNumber });
        res.json({ code: 200, success: true, message: "data is deleted successfully" })
    } catch (error) {
        res.json({ code: 400, success: false, message: "error in counter DELETE", error: error.message })

    }
}