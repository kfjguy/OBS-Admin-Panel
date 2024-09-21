const express = require('express');
const path = require('path');
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

module.exports = router;
