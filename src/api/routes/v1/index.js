const express = require('express');
const series1Routes = require('./series1.route')
const series2Routes = require('./series2.route')
const counterRoutes = require('./counter.route')
const gameEndRoutes = require('./gameEnd.route')
const gameRouter = require('./game.route')
const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'))

/**
 * GET v1/docs
 */

router.use('/docs', express.static('docs'));
router.use('/series1', series1Routes)
router.use('/series2', series2Routes)
router.use('/counter', counterRoutes)
router.use('/game/end', gameEndRoutes)
router.use('/game',gameRouter)

module.exports = router;