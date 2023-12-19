// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const {env, port} = require('./config/vars');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const express = require('express')
const path = require("path");
const bodyParser = require('body-parser');
const cors = require('cors');
// const controller = require('./api/controllers/series2Nft.controller')

// open mongoose connection
mongoose.connect()
//CronJob
// require('./api/crons/cronjob');
// listening to requests
app.listen(port, () => console.log(`server started on port ${port}`))
app.use('/', express.static(path.join(__dirname, '../build')))
app.use(cors());
// controller.generateIds();

app.use(bodyParser.json());
app.use(express.json());

/**
* Exports express
* @public
*/
module.exports = app;