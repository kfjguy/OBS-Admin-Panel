const express = require('express');
const path = require('path');
const obsSceneController = require('../../js/obs/obsSceneController');
const router = express.Router();

router.use(express.json());

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../client/html/obs/scenes.html'));
});

router.get('/openEditScene/:sceneName', (req, res) => {
    const { sceneName } = req.params;
    res.sendFile(path.join(__dirname, '../../../client/html/obs/editScene.html'));
});

// GET SCENE
router.get('/getScene', async (req, res) => {
    try {
        const scene = await obsSceneController.getScene();
        res.json(scene);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve scene' });
    }
});

// GET SCENES LIST
router.get('/getScenesList', async (req, res) => {
    try {
        const scenes = await obsSceneController.getScenesList();
        res.json(scenes);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve scenes list' });
    }
});

// SET SCENE
router.post('/setScene/:sceneName', async (req, res) => {
    const { sceneName } = req.params;
    try {
        if (await obsSceneController.setScene(sceneName) === false) {
            res.status(400).json({ error: '[400] Scene not set' });
        } else {
            res.status(200).json({ message: '[200] Scene set' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to set scene' });
    }
});

// CREATE SCENE
router.post('/createScene/:sceneName', async (req, res) => {
    const { sceneName } = req.params;
    try {
        if (await obsSceneController.createScene(sceneName) === false) {
            res.status(400).json({ error: '[400] Scene not created' });
        } else {
            res.status(200).json({ message: '[200] Scene created' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create scene' });
    }
});

// REMOVE SCENE
router.post('/removeScene/:sceneName', async (req, res) => {
    const { sceneName } = req.params;
    try {
        if (await obsSceneController.removeScene(sceneName) === false) {
            res.status(400).json({ error: '[400] Scene not removed' });
        } else {
            res.status(200).json({ message: '[200] Scene removed' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to remove scene' });
    }
});

// GET SCENE ITEMS
router.get('/getSceneItems/:sceneName', async (req, res) => {
    const { sceneName } = req.params;
    try {
        const sceneItems = await obsSceneController.getSceneItems(sceneName);
        res.json(sceneItems);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to retrieve scene items' });
    }
});

// ADD SCENE ITEM
router.post('/addSceneItem/:sceneName', async (req, res) => {
    const { sceneName } = req.params;
    const sceneItem = req.body;
    try {
        const success = await obsSceneController.addSceneItem(sceneName, sceneItem);
        if (!success) {
            res.status(400).json({ error: '[400] Scene item not added' });
        } else {
            res.status(201).json({ message: '[201] Scene item added' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to add scene item' });
    }
});

// UPDATE SCENE ITEM
router.put('/updateSceneItem/:sceneName/:itemId', async (req, res) => {
    const { sceneName, itemId } = req.params;
    const sceneItemUpdates = req.body;
    try {
        const success = await obsSceneController.updateSceneItem(sceneName, itemId, sceneItemUpdates);
        if (!success) {
            res.status(400).json({ error: '[400] Scene item not found or not updated' });
        } else {
            res.status(200).json({ message: '[200] Scene item updated' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update scene item' });
    }
});

// REMOVE SCENE ITEM
router.delete('/removeSceneItem/:sceneName/:itemId', async (req, res) => {
    const { sceneName, itemId } = req.params;
    try {
        const success = await obsSceneController.removeSceneItem(sceneName, itemId);
        if (!success) {
            res.status(400).json({ error: '[400] Scene item not found or not removed' });
        } else {
            res.status(200).json({ message: '[200] Scene item removed' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to remove scene item' });
    }
});

// TOGGLE VISIBILITY OF SCENE ITEM
router.put('/toggleSceneItemVisibility/:sceneName/:itemId', async (req, res) => {
    const { sceneName, itemId } = req.params;
    try {
        const success = await obsSceneController.toggleSceneItemVisibility(sceneName, itemId);
        if (!success) {
            res.status(400).json({ error: '[400] Scene item visibility not toggled' });
        } else {
            res.status(200).json({ message: '[200] Scene item visibility toggled' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to toggle scene item visibility' });
    }
});

module.exports = router;