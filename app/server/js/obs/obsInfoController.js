const { obs, checkConnection } = require('./obsWebSocketController');

async function getStats() {
    checkConnection();
    try {
        const stats = await obs.call('GetStats');
        return stats;
    } catch (error) {
        console.error('[ERR] Error getting stats:', error);
        throw error;
    }
}

module.exports = {
    getStats
};