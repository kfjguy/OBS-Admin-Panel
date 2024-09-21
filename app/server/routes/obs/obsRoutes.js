const { routeCheckIsConnected } = require('../../js/obs/obsWebSocketController');
const express = require('express');
const path = require('path');
const router = express.Router();

router.use('/scenes', routeCheckIsConnected, require('./obsSceneRoutes'));
router.use('/actions', routeCheckIsConnected, require('./obsActionRoutes'));

module.exports = router;