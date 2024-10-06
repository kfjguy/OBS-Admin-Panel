const urlSegments = window.location.pathname.split('/').filter(segment => segment);
const sceneName = decodeURIComponent(urlSegments.pop() || '');

let selectedElement = null;
let outlineElements = { top: null, bottom: null, left: null, right: null };

// DOM elements
const imageContainer = document.getElementById('imageContainer');
const sceneItemsContainer = document.getElementById('sceneItemsContainer');

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function reloadScene() {
    const sceneItemsContainer = document.getElementById('sceneItemsContainer');
    while (sceneItemsContainer.firstChild) {
        sceneItemsContainer.removeChild(sceneItemsContainer.firstChild);
    }
    await loadPreview(sceneName);
    selectedElement = null;
}

const debouncedReloadScene = debounce(reloadScene, 300);

function loadItems(items) {
    items.forEach((item) => {
        const element = document.createElement('div');
        element.className = 'scene-item';
        element.style.position = 'absolute';

        element.id = `scene-item-${item.sceneItemId}`;

        const transform = item.sceneItemTransform;
        const x = transform.positionX || 0;
        const y = transform.positionY || 0;
        const width = transform.width || 100;
        const height = transform.height || 100;

        const scaleFactor = window.scaleFactor || 1;
        const scaledX = x / scaleFactor;
        const scaledY = y / scaleFactor;
        const scaledWidth = width / scaleFactor;
        const scaledHeight = height / scaleFactor;

        element.style.left = `${scaledX}px`;
        element.style.top = `${scaledY}px`;
        element.style.width = `${scaledWidth}px`;
        element.style.height = `${scaledHeight}px`;

        element.style.boxSizing = 'border-box';
        element.style.border = '4px dashed red';
        element.style.backgroundColor = 'rgba(128, 128, 128, 0.05)';
        element.style.opacity = '1';
        element.style.cursor = 'pointer';
        element.style.zIndex = '10';

        element.setAttribute('data-id', item.sceneItemId);
        element.setAttribute('data-x', scaledX);
        element.setAttribute('data-y', scaledY);
        element.setAttribute('data-width', scaledWidth);
        element.setAttribute('data-height', scaledHeight);
        element.setAttribute('data-name', item.sourceName || 'Unknown');
        element.setAttribute('data-visible', item.sceneItemEnabled);
        element.setAttribute('data-locked', item.sceneItemLocked);

        sceneItemsContainer.appendChild(element);

        makeElementInteractive(element);
    });
}

async function updatePreview(imageData) {
    try {
        const previewImage = document.getElementById('fhdPreviewImage');
        previewImage.src = imageData;

        previewImage.onload = () => {
            const naturalWidth = previewImage.naturalWidth;
            const displayedWidth = previewImage.clientWidth;
            window.scaleFactor = naturalWidth / displayedWidth;
            getAllSceneItems(sceneName);
        };
    } catch (error) {
        console.error("[ERR] Error updating preview: ", error);
    }
}

async function loadPreview(sceneName) {
    try {
        const imageDataResponse = await fetch(`/obs/actions/getPreviewOfScene/${sceneName}/1920/1080/100`);
        const imageData = await imageDataResponse.json();
        const base64Image = imageData.preview;

        await updatePreview(base64Image);
    } catch (error) {
        console.error("[ERR] Error previewing scene: ", error);
    }
}

async function getAllSceneItems(sceneName) {
    try {
        const response = await fetch(`/obs/scenes/getSceneItems/${sceneName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const items = await response.json();
        loadItems(items);
    } catch (error) {
        console.error("[ERR] Error fetching scene items: ", error);
    }
}

async function updateSceneItemPosition(sceneName, sceneItemId, x, y) {
    try {
        const response = await fetch(`/obs/scenes/updateSceneItem/${sceneName}/${sceneItemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                position: { x, y }
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("[ERR] Error updating scene item position: ", error);
    }
}

// Initialize the scene editor
(async function initialize() {
    await loadPreview(sceneName);
})();

function makeElementInteractive(element) {
    interact(element)
        .draggable({
            listeners: {
                move: dragMoveListener,
                end: dragEndListener
            }
        });

    element.addEventListener('click', (event) => {
        event.stopPropagation();
        selectElement(element);
    });
}

function dragMoveListener(event) {
    const target = event.target;
    const scaleFactor = window.scaleFactor || 1;

    let x = parseFloat(target.getAttribute('data-x')) || 0;
    let y = parseFloat(target.getAttribute('data-y')) || 0;

    x += event.dx * scaleFactor;
    y += event.dy * scaleFactor;

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);

    if (selectedElement === target) {
        updateInspector(target);
    }
}

async function dragEndListener(event) {
    const target = event.target;
    const sceneItemId = target.getAttribute('data-id');
    const scaleFactor = window.scaleFactor || 1;

    const x = parseFloat(target.getAttribute('data-x')) || 0;
    const y = parseFloat(target.getAttribute('data-y')) || 0;

    const originalX = x * scaleFactor;
    const originalY = y * scaleFactor;

    await updateSceneItemPosition(sceneName, sceneItemId, originalX, originalY);
    await debouncedReloadScene();
}

function selectElement(element) {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
    selectedElement = element;
    selectedElement.classList.add('selected');
    updateInspector(element);
}

function updateInspector(element) {
    const elementNameInput = document.getElementById('elementName');
    const elementVisibilityInput = document.getElementById('elementVisibility');
    const elementLockedInput = document.getElementById('elementLocked');
    const elementWidthInput = document.getElementById('elementWidth');
    const elementHeightInput = document.getElementById('elementHeight');
    const elementXInput = document.getElementById('elementX');
    const elementYInput = document.getElementById('elementY');

    elementNameInput.value = element.getAttribute('data-name') || '';
    elementVisibilityInput.checked = (element.getAttribute('data-visible') === 'true');
    elementLockedInput.checked = (element.getAttribute('data-locked') === 'true');
    elementWidthInput.value = parseFloat(element.getAttribute('data-width')) || 0;
    elementHeightInput.value = parseFloat(element.getAttribute('data-height')) || 0;
    elementXInput.value = parseFloat(element.getAttribute('data-x')) || 0;
    elementYInput.value = parseFloat(element.getAttribute('data-y')) || 0;
}