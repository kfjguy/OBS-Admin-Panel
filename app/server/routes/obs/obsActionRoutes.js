const express = require('express');
const obsActionController = require('../../js/obs/obsActionController');
const router = express.Router();

// PREVIEW SCENE
router.get('/getPreviewOfScene/:sceneName/:width/:height/:quality', async (req, res) => {
    try {
        const { sceneName, width, height, quality } = req.params;
        const preview = await obsActionController.getPreviewOfScene(sceneName, width, height, quality);
        res.json({ preview });
    } catch(error) {
        res.status(500).json({ error: error.message || 'Failed to get preview of scene' });
    }
});

// STATS
router.get('/getStats', async (req, res) => {
    try {
        const stats = await obsActionController.getStats();
        res.json(stats);
    } catch(error) {
        res.status(500).json({ error: error.message || 'Failed to get OBS stats' });
    }
});

// VERSION
router.get('/getVersion', async (req, res) => {
    try {
        const version = await obsActionController.getVersion();
        res.json(version);
    } catch(error) {
        res.status(500).json({ error: error.message || 'Failed to get OBS version' });
    }
});

module.exports = router;
