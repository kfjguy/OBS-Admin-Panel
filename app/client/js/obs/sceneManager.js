document.addEventListener("DOMContentLoaded", async () => {
    await updateScenes();
    await previewScene('active-scene');

    const socket = io();

    //#region Subscriber
    socket.on('scene-list-changed', async () => {
        await updateScenes();
    });

    socket.on('current-program-scene-changed', async () => {
        await updateScenes();
    });

    socket.on('obs-connected', async () => {
        await updateScenes();
    });

    socket.on('obs-disconnected', async () => {
        location.reload();
    });
    //#endregion Subscriber

    // Create a new scene
    const addSceneButton = document.querySelector('.btn-green');
    addSceneButton.addEventListener('click', () => {
        const inputBar = document.getElementById('input-bar');
        const sceneName = inputBar.value.trim();
        if (sceneName) {
            createNewScene(sceneName);
            inputBar.value = '';
        }
    });
});

async function updateScenes() {
    try {
        // Fetch the current scene
        const currentSceneResponse = await fetch('/obs/scenes/getScene');
        const currentScene = await currentSceneResponse.json();
        document.getElementById('current-scene').textContent = currentScene;

        // Fetch all scenes
        const allScenesResponse = await fetch('/obs/scenes/getScenesList');
        if (!allScenesResponse.ok) {
            console.error(`Error fetching scenes list: ${allScenesResponse.status} ${allScenesResponse.statusText}`);
            throw new Error(`Error fetching scenes list: ${allScenesResponse.statusText}`);
        }
        const allScenes = await allScenesResponse.json();
        allScenes.reverse();

        // Update the scene list
        const sceneList = document.getElementById('scene-list');
        sceneList.innerHTML = '';

        allScenes.forEach(scene => {
            const sceneItem = document.createElement('li');
            sceneItem.className = `scene-item ${scene.sceneName === currentScene.sceneName ? 'active' : ''}`;
            sceneItem.innerHTML = `
                <span>${scene.sceneName}</span>
                <div>
                    <button class="btn btn-switch" onclick="switchScene('${scene.sceneName}')">Switch</button>
                    <button class="btn btn-remove" onclick="removeScene('${scene.sceneName}')">Remove</button>
                    <button class="btn btn-edit" onclick="openEditScene('${scene.sceneName}')">Edit</button>
                    <button class="btn btn-preview" onclick="previewScene('${scene.sceneName}')">Preview</button>
                </div>
            `;
            sceneList.appendChild(sceneItem);
        });
    } catch (error) {
        console.error("[ERR] Error updating scenes: ", error);
    }
}

async function updatePreview(imageData) {
    const previewImage = document.getElementById('preview-image');
    previewImage.src = imageData;
}

// SWITCH SCENE
async function switchScene(sceneName) {
    if (!await verifyPopup(`Are you sure you want to SWITCH to the scene "${sceneName}"?`)) { return; }
    try {
        await fetch('/obs/scenes/setScene/' + sceneName, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        await updateScenes();
        await previewScene(sceneName);
    } catch (error) {
        console.error("[ERR] Error switching scene: ", error);
    }
}

// CREATE SCENE
async function createNewScene(sceneName) {
    if (!await verifyPopup(`Are you sure you want to CREATE the scene "${sceneName}"?`)) { return; }
    try {
        await fetch('/obs/scenes/createScene/' + sceneName, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        await updateScenes();
    } catch (error) {
        console.error("[ERR] Error creating scene: ", error);
    }
}

// REMOVE SCENE
async function removeScene(sceneName) {
    if (!await verifyPopup(`Are you sure you want to REMOVE the scene "${sceneName}"?`)) { return; }
    try {
        await fetch('/obs/scenes/removeScene/' + sceneName, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        await updateScenes();
    } catch (error) {
        console.error("[ERR] Error removing scene: ", error);
    }
}

// PREVIEW SCENE
async function previewScene(sceneName) {
    try {
        const imageDataResponse = await fetch(`/obs/actions/getPreviewOfScene/${sceneName}/1200/675/-1`);
        const imageData = await imageDataResponse.json();
        const base64Image = imageData.preview;

        if (base64Image) {
            await updatePreview(base64Image);
        }
    } catch (error) {
        console.error("[ERR] Error previewing scene: ", error);
    }
}

// EDIT SCENE
async function openEditScene(sceneName) {
    if (!sceneName) { return; }
    try {
        window.location.href = '/obs/scenes/openEditScene/' + sceneName;
    } catch (error) {
        console.error("[ERR] Error opening edit scene");
    }
}
