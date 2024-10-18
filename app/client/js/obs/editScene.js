const urlSegments = window.location.pathname.split('/').filter(segment => segment);
const sceneName = decodeURIComponent(urlSegments.pop() || '');

let selectedElement = null;
let updateTimer = null;
const MOVE_STEP = 5;

// DOM Elements
const imageContainer = document.getElementById('imageContainer');
const sceneItemsContainer = document.getElementById('sceneItemsContainer');
const elementNameInput = document.getElementById('elementName');
const elementVisibilityInput = document.getElementById('elementVisibility');
const elementLockedInput = document.getElementById('elementLocked');
const elementWidthInput = document.getElementById('elementWidth');
const elementHeightInput = document.getElementById('elementHeight');
const elementXInput = document.getElementById('elementX');
const elementYInput = document.getElementById('elementY');

function roundToDecimals(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function reloadScene() {
    while (sceneItemsContainer.firstChild) {
        sceneItemsContainer.removeChild(sceneItemsContainer.firstChild);
    }
    await loadPreview();
    selectedElement = null;
    updateInspector(selectedElement);
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
        element.style.backgroundColor = 'rgba(128, 128, 128, 0.05)';
        element.style.opacity = '1';
        element.style.zIndex = '10';

        element.setAttribute('data-id', item.sceneItemId);
        element.setAttribute('data-x', roundToDecimals(scaledX, 0));
        element.setAttribute('data-y', roundToDecimals(scaledY, 0));
        element.setAttribute('data-width', roundToDecimals(scaledWidth, 2));
        element.setAttribute('data-height', roundToDecimals(scaledHeight, 2));
        element.setAttribute('data-name', item.sourceName || 'Unknown');
        element.setAttribute('data-visible', item.sceneItemEnabled);
        element.setAttribute('data-locked', item.sceneItemLocked);

        if (item.sceneItemLocked) {
            element.classList.add('locked');
        }

        if (!item.sceneItemLocked) {
            element.classList.add('draggable');
        }

        sceneItemsContainer.appendChild(element);
        makeElementInteractive(element);
    });
}

// Initialize the Scene Editor
(async function initialize() {
    await loadPreview();
    updateInspector(null);
})();

function makeElementInteractive(element) {
    const isLocked = element.getAttribute('data-locked') === 'true';

    if (!isLocked) {
        interact(element)
            .draggable({
                listeners: {
                    move: dragMoveListener,
                    end: dragEndListener
                },
                // // restrict movement
                // modifiers: [
                //     interact.modifiers.restrictRect({
                //         restriction: 'parent',
                //         endOnly: true
                //     })
                // ],
                inertia: true
            });
        element.classList.add('draggable');
    } else {
        interact(element).unset();
        element.classList.remove('draggable');
    }

    element.addEventListener('click', (event) => {
        event.stopPropagation();
        selectElement(element);
    });
}

function dragMoveListener(event) {
    const target = event.target;
    const isLocked = target.getAttribute('data-locked') === 'true';
    if (isLocked) {
        return;
    }

    const scaleFactor = window.scaleFactor || 1;

    let x = parseFloat(target.getAttribute('data-x')) || 0;
    let y = parseFloat(target.getAttribute('data-y')) || 0;

    x += event.dx * scaleFactor;
    y += event.dy * scaleFactor;

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    target.setAttribute('data-x', roundToDecimals(x, 0));
    target.setAttribute('data-y', roundToDecimals(y, 0));

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

    await updateSceneItemPosition(sceneItemId, originalX, originalY);
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
    if (element) {
        elementNameInput.disabled = true; // TODO
        elementVisibilityInput.disabled = false;
        elementLockedInput.disabled = false;
        elementWidthInput.disabled = true; // TODO
        elementHeightInput.disabled = true; // TODO
        elementXInput.disabled = false;
        elementYInput.disabled = false;

        elementNameInput.value = element.getAttribute('data-name') || '';
        elementVisibilityInput.checked = (element.getAttribute('data-visible') === 'true');
        elementLockedInput.checked = (element.getAttribute('data-locked') === 'true');
        elementWidthInput.value = parseFloat(element.getAttribute('data-width')) || 0;
        elementHeightInput.value = parseFloat(element.getAttribute('data-height')) || 0;
        elementXInput.value = parseFloat(element.getAttribute('data-x')) || 0;
        elementYInput.value = parseFloat(element.getAttribute('data-y')) || 0;
    } else {
        elementNameInput.disabled = true;
        elementVisibilityInput.disabled = true;
        elementLockedInput.disabled = true;
        elementWidthInput.disabled = true;
        elementHeightInput.disabled = true;
        elementXInput.disabled = true;
        elementYInput.disabled = true;

        elementNameInput.value = '';
        elementVisibilityInput.checked = false;
        elementLockedInput.checked = false;
        elementWidthInput.value = 0;
        elementHeightInput.value = 0;
        elementXInput.value = 0;
        elementYInput.value = 0;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('keydown', (event) => {
    if (!selectedElement) {
        return;
    }

    let handled = false;
    let deltaX = 0;
    let deltaY = 0;

    let step = MOVE_STEP;
    if (event.shiftKey) {
        step *= 2;
    }

    switch(event.key) {
        case 'ArrowUp':
            deltaY = -step;
            handled = true;
            break;
        case 'ArrowDown':
            deltaY = step;
            handled = true;
            break;
        case 'ArrowLeft':
            deltaX = -step;
            handled = true;
            break;
        case 'ArrowRight':
            deltaX = step;
            handled = true;
            break;
        default:
            break;
    }

    if (handled) {
        event.preventDefault();
        const scaleFactor = window.scaleFactor || 1;

        let x = parseFloat(selectedElement.getAttribute('data-x')) || 0;
        let y = parseFloat(selectedElement.getAttribute('data-y')) || 0;

        x += deltaX * scaleFactor;
        y += deltaY * scaleFactor;

        selectedElement.style.left = `${x}px`;
        selectedElement.style.top = `${y}px`;

        selectedElement.setAttribute('data-x', roundToDecimals(x, 0));
        selectedElement.setAttribute('data-y', roundToDecimals(y, 0));

        updateInspector(selectedElement);

        if (updateTimer) {
            clearTimeout(updateTimer);
        }

        updateTimer = setTimeout(async () => {
            try {
                await updateSceneItemPosition(
                    selectedElement.getAttribute('data-id'),
                    x * scaleFactor,
                    y * scaleFactor
                );
                await debouncedReloadScene();
            } catch (error) {
                console.error("[ERR] Error updating position via arrow keys: ", error);
            }
        }, 1000); // 1 sec
    }
});

async function updatePreview(imageData) {
    try {
        const previewImage = document.getElementById('fhdPreviewImage');
        previewImage.src = imageData;

        previewImage.onload = () => {
            const naturalWidth = previewImage.naturalWidth;
            const displayedWidth = previewImage.clientWidth;
            window.scaleFactor = naturalWidth / displayedWidth;
            getAllSceneItems();
        };
    } catch (error) {
        console.error("[ERR] Error updating preview: ", error);
    }
}

async function loadPreview() {
    try {
        const imageDataResponse = await fetch(`/obs/actions/getPreviewOfScene/${sceneName}/1920/1080/100`);
        const imageData = await imageDataResponse.json();
        const base64Image = imageData.preview;

        await updatePreview(base64Image);
    } catch (error) {
        console.error("[ERR] Error previewing scene: ", error);
    }
}

async function getAllSceneItems() {
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

async function updateSceneItemPosition(sceneItemId, x, y) {
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

async function toggleLock(itemID) {
    try {
        await fetch(`/obs/scenes/toggleSceneItemLock/${encodeURIComponent(sceneName)}/${encodeURIComponent(itemID)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (selectedElement && selectedElement.getAttribute('data-id') === itemID) {
            const isLocked = selectedElement.getAttribute('data-locked') === 'true';
            selectedElement.setAttribute('data-locked', !isLocked);

            if (!isLocked) {
                selectedElement.classList.add('locked');
                selectedElement.classList.remove('selected');
                selectedElement.classList.remove('draggable');
                interact(selectedElement).unset();
            } else {
                selectedElement.classList.remove('locked');
                selectedElement.classList.add('draggable');
                makeElementInteractive(selectedElement);
            }

            updateInspector(selectedElement);
        } else {
            await debouncedReloadScene();
        }
    } catch (error) {
        console.error("[ERR]: ", error);
    }
}

async function toggleVisibility(itemID) {
    try {
        await fetch(`/obs/scenes/toggleSceneItemVisibility/${encodeURIComponent(sceneName)}/${encodeURIComponent(itemID)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        await debouncedReloadScene();
    } catch (error) {
        console.error("[ERR]: ", error);
    }
}

elementLockedInput.addEventListener('change', () => {
    if (!selectedElement) {
        return;
    }
    toggleLock(selectedElement.getAttribute('data-id'));
});

elementVisibilityInput.addEventListener('change', () => {
    if (!selectedElement) {
        return;
    }
    toggleVisibility(selectedElement.getAttribute('data-id'));
});

sceneItemsContainer.addEventListener('click', () => {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
        updateInspector(null);
    }
});

elementXInput.addEventListener('change', () => {
    if (!selectedElement) {
        return;
    }
    const sceneItemId = selectedElement.getAttribute('data-id');
    const scaleFactor = window.scaleFactor || 1;

    const newX = Number(elementXInput.value) * scaleFactor;
    const newY = Number(elementYInput.value) * scaleFactor;

    updateSceneItemPosition(sceneItemId, newX, newY);
    debouncedReloadScene();
});

elementYInput.addEventListener('change', () => {
    if (!selectedElement) {
        return;
    }
    const sceneItemId = selectedElement.getAttribute('data-id');
    const scaleFactor = window.scaleFactor || 1;

    const newX = Number(elementXInput.value) * scaleFactor;
    const newY = Number(elementYInput.value) * scaleFactor;

    updateSceneItemPosition(sceneItemId, newX, newY);
    debouncedReloadScene();
});