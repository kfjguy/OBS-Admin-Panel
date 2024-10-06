const { obs, checkConnection } = require('./obsWebSocketController');

// GET CURRENT SCENE
async function getScene() {
    checkConnection();
    try {
        const { currentProgramSceneName } = await obs.call('GetCurrentProgramScene');
        return currentProgramSceneName;
    } catch (error) {
        console.error('[ERR] Error getting current scene:', error);
        throw error;
    }
}

// GET SCENES LIST
async function getScenesList() {
    checkConnection();
    try {
        const { scenes } = await obs.call('GetSceneList');
        return scenes;
    } catch (error) {
        console.error('[ERR] Error getting scenes list:', error);
        throw error;
    }
}

// SET SCENE
async function setScene(sceneName) {
    checkConnection();
    if (!await sceneExists(sceneName)) { return false; };
    try {
        await obs.call('SetCurrentProgramScene', { 'sceneName': sceneName });
        return true;
    } catch (error) {
        console.error('[ERR] Error setting scene:', error);
        return false;
    }
}

// CREATE SCENE
async function createScene(sceneName) {
    checkConnection();
    if (await sceneExists(sceneName)) { return false; };
    try {
        await obs.call('CreateScene', { 'sceneName': sceneName });
        return true;
    } catch (error) {
        console.error('[ERR] Error creating scene:', error);
        return false;
    }
}

// REMOVE SCENE
async function removeScene(sceneName) {
    checkConnection();
    if (!await sceneExists(sceneName)) { return false; };
    try {
        await obs.call('RemoveScene', { 'sceneName': sceneName });
        return true;
    } catch (error) {
        console.error('[ERR] Error removing scene:', error);
        return false;
    }
}

// GET SCENE ITEMS
async function getSceneItems(sceneName) {
    checkConnection();
    try {
        const { sceneItems } = await obs.call('GetSceneItemList', { sceneName });

        const itemsWithProperties = await Promise.all(sceneItems.map(async item => {
            const { sceneItemTransform } = await obs.call('GetSceneItemTransform', {
                sceneName,
                sceneItemId: item.sceneItemId
            });
            return {
                ...item,
                sceneItemTransform
            };
        }));

        return itemsWithProperties;
    } catch (error) {
        console.error('[ERR] Error getting scene items:', error);
        throw error;
    }
}

// ADD SCENE ITEM
async function addSceneItem(sceneName, item) {
    checkConnection();
    try {
        await obs.call('CreateSceneItem', { sceneName, sourceName: item.content, ...item });
        return true;
    } catch (error) {
        console.error('[ERR] Error adding scene item:', error);
        return false;
    }
}

// UPDATE SCENE ITEM
async function updateSceneItem(sceneName, sceneItemId, updates) {
    checkConnection();
    try {
        const params = {
            sceneName,
            sceneItemId: parseInt(sceneItemId),
        };

        if (updates.position) {
            params['sceneItemTransform'] = {
                positionX: updates.position.x,
                positionY: updates.position.y
            };
        }

        await obs.call('SetSceneItemTransform', params);
        return true;
    } catch (error) {
        console.error('[ERR] Error updating scene item:', error);
        return false;
    }
}

// REMOVE SCENE ITEM
async function removeSceneItem(sceneName, itemId) {
    checkConnection();
    try {
        await obs.call('DeleteSceneItem', { sceneName, sceneItemId: itemId });
        return true;
    } catch (error) {
        console.error('[ERR] Error removing scene item:', error);
        return false;
    }
}

// TOGGLE VISIBILITY OF SCENE ITEM
async function toggleSceneItemVisibility(sceneName, itemId) {
    checkConnection();
    try {
        const { visible } = await obs.call('GetSceneItemProperties', { sceneName, itemId });
        await obs.call('SetSceneItemProperties', { sceneName, itemId, visible: !visible });
        return true;
    } catch (error) {
        console.error('[ERR] Error toggling scene item visibility:', error);
        return false;
    }
}

// TOGGLE LOCK OF SCENE ITEM
async function toggleSceneItemLock(sceneName, itemId) {
    checkConnection();
    try {
        const { locked } = await obs.call('GetSceneItemProperties', { sceneName, itemId });
        await obs.call('SetSceneItemProperties', { sceneName, itemId, locked: !locked });
        return true;
    } catch (error) {
        console.error('[ERR] Error toggling scene item lock:', error);
        return false;
    }
}

//#region Helper functions
async function sceneExists(sceneName) {
    try {
        const scenes = await getScenesList();
        if (!Array.isArray(scenes)) {
            return false;
        }
        const sceneExists = scenes.some(scene => scene.sceneName.trim().toLowerCase() === sceneName.trim().toLowerCase());
        if (sceneExists) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}
//#endregion Helper functions

module.exports = {
    getScene,
    getScenesList,
    setScene,
    createScene,
    removeScene,
    sceneExists,
    getSceneItems,
    addSceneItem,
    updateSceneItem,
    removeSceneItem,
    toggleSceneItemVisibility,
    toggleSceneItemLock
};
