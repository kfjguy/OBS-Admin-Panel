document.addEventListener("DOMContentLoaded", async () => {
    try {
        // HANDLE TILES
        const obsSceneManagerTile = document.getElementById("obs-scene-manager");

        obsSceneManagerTile.addEventListener("click", (event) => {
            window.location.href = '/obs/scenes';
        });


    } catch (error) {
        console.error("[ERR] Error in handle tiles");
    }
});
