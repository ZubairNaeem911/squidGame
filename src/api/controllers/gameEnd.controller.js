const GameEnd = require('../models/gameEnd.model');
const httpStatus = require('http-status');
const { findOne } = require('../models/gameEnd.model');


exports.create = async (req, res) => {
    try {
        let data = req.body;
console.log(data, "dataaaaaaaaaaaaaaaaa")
        let gameEndPrevData = await GameEnd.findOne({ walletAddress: data.walletAddress });
        if (gameEndPrevData) {
            gameEndPrevData.gameEnd = data.gameEnd;
            await gameEndPrevData.save();
            res.json({ code: 200, success: true, data: gameEndPrevData })
        }
        else {
            data.gameEnd = false;
            
            let gameEndNewData = new GameEnd(data)
            console.log(gameEndNewData, " new game end data");
            let savedGameEndData = await gameEndNewData.save();
            res.status(httpStatus.CREATED);
            res.json({ code: 200, success: true, data: savedGameEndData })
        }

    } catch (error) {
        res.json({ code: 400, success: false, message: "error in POST API of game end" })

    }
}


exports.getGameEndFlag = async (req, res) => {
    try {
        let data = req.body;
        
        let gameEndPrevData = await GameEnd.findOne({ walletAddress: data.walletAddress })
        if (gameEndPrevData) {
            res.json({ code: 200, success: true, data: { gameEnd: gameEndPrevData.gameEnd } })
        }
        else {
            res.json({ code: 400, success: false, message: "data not found" })
        }
    } catch (error) {
        res.json({ code: 403, success: false, message: "Error in getting game end flag API" })

    }
}