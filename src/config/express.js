const express = require("express");
const bodyParser = require('body-parser')
// import error from '../api/middlewares/error';
const routes = require("../api/routes/v1");
const morgan = require("morgan");
const compress = require("compression");
const methodOverride = require("method-override");
const cors = require("cors");

/**
 * Express instance
 * @public
 */

const app = express();
app.use(morgan('dev'));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(methodOverride());

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
  app.use(cors(corsOptions));
  
  // compress all responses
  app.use(compress());
  
  // mount admin api v1 routes
  app.use('/v1', routes);
  app.get('/test', (req, res) => {
    res.send({status: 200, message: 'server working'})
  });


  module.exports = app;