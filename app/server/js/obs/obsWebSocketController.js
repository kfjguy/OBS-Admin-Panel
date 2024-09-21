require('dotenv').config();
const { OBSWebSocket } = require('obs-websocket-js');

let ioInstance;
let connected = false;
let reconnecting = false;
const obsWebSocketConnectionRetryDelay = process.env.OBS_WEBSOCKET_CONNECTION_RETRY_DELAY;
const obsWebSocketAddress = process.env.OBS_WEBSOCKET_ADDRESS;
const obsWebSocketPassword = process.env.OBS_WEBSOCKET_PASSWORD;
const obs = new OBSWebSocket();

//#region Event Listeners
function setupEventListeners() {
    //#region Connection Events
    obs.on('ConnectionOpened', () => {
        connected = true;
        reconnecting = false;
        if (ioInstance) {
            ioInstance.emit('obs-connected');
        }
        console.log('[CON] Connection opened');
    });

    obs.on('ConnectionClosed', () => {
        connected = false;
        if (ioInstance) {
            ioInstance.emit('obs-disconnected');
        }
        timedReconnectOBS();
    });

    obs.on('ConnectionError', () => {
        connected = false;
        if (ioInstance) {
            ioInstance.emit('obs-disconnected');
        }
        timedReconnectOBS();
    });

    obs.on('ExitStarted', () => {
        connected = false;
        if (ioInstance) {
            ioInstance.emit('obs-disconnected');
        }
        timedReconnectOBS();
    });
    //#endregion Connection Events

    //#region Scene Events
    obs.on('SwitchScenes', (data) => {
        if (ioInstance) {
            ioInstance.emit('scene-switched', data);
        }
    });

    obs.on('CurrentProgramSceneChanged', (data) => {
        if (ioInstance) {
            ioInstance.emit('current-program-scene-changed', data);
        }
    });

    obs.on('SceneListChanged', (data) => {
        if (ioInstance) {
            ioInstance.emit('scene-list-changed', data);
        }
    });
    //#endregion Scene Events
}
//#endregion Event Listeners

//#region Connection Functions
async function connectToOBS() {
    try {
        await obs.connect(obsWebSocketAddress, obsWebSocketPassword);
    } catch (error) {
        timedReconnectOBS();
    }
}

function timedReconnectOBS() {
    if (reconnecting) {
        return;
    }
    reconnecting = true;
    console.error(`[ERR] Connection to OBS failed - Retrying in ${obsWebSocketConnectionRetryDelay / 1000} seconds`);
    setTimeout(() => {
        reconnecting = false;
        connectToOBS();
    }, obsWebSocketConnectionRetryDelay);
}

function isConnected() {
    return connected;
}

function checkConnection() {
    if (!connected) {
        console.error('[ERR] Not connected to OBS WebSocket');
        return false;
    }
    return true;
}

function routeCheckIsConnected(req, res, next) {
    if (isConnected()) { return next(); }
    const originalUrl = req.originalUrl;
    const encodedOriginalUrl = encodeURIComponent(originalUrl);
    const redirectUrl = `/error/500?triggeredBy=${encodedOriginalUrl}`;
    return res.redirect(redirectUrl);
}
//#endregion Connection Functions

function initialize(io) {
    ioInstance = io;
    setupEventListeners();
    connectToOBS();

    process.on('SIGINT', () => {
        obs.disconnect();
        process.exit();
    });
}

module.exports = {
    obs,
    initialize,
    isConnected,
    checkConnection,
    routeCheckIsConnected
};
