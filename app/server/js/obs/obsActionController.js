const { obs, checkConnection } = require('./obsWebSocketController');
const { sceneExists, getScene } = require('./obsSceneController');
const { getStats } = require('./obsInfoController');

// PREVIEW OF SCENE
async function getPreviewOfScene(sceneName, width, height, quality) {
    checkConnection();
    if (sceneName === 'active-scene') { sceneName = await getScene(); }
    if (!await sceneExists(sceneName)) { return false; };
    try {
        const { imageData } = await obs.call('GetSourceScreenshot', {
            sourceName: sceneName,
            imageFormat: "jpg",
            imageWidth: parseInt(width, 10),
            imageHeight: parseInt(height, 10),
            imageCompressionQuality: parseInt(quality, 10)
        });
        return imageData;
    } catch (err) {
        console.error('Error getting preview:', err);
        throw err;
    }
}

// STATS
async function getVersion() {
    checkConnection();
    try {
        const status = await obs.call('GetStats');
        return status;
    } catch (error) {
        console.error('[ERR] Error getting status:', error);
        throw error;
    }
}

// VERSION
async function getVersion() {
    checkConnection();
    try {
        const status = await obs.call('GetVersion');
        return status;
    } catch (error) {
        console.error('[ERR] Error getting version:', error);
        throw error;
    }
}

module.exports = {
    getPreviewOfScene,
    getStats,
    getVersion
};