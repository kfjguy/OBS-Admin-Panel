document.addEventListener("DOMContentLoaded", async () => {
    try {
        // LOAD DASHBOARD BUTTON
        const dashboardButtonResponse = await fetch('/html/elements/dashboardButton.html');
        if (!dashboardButtonResponse.ok) {
            throw new Error('Failed to load dashboard button HTML');
        }
        const dashboardButtonHTML = await dashboardButtonResponse.text();
        const dashboardButtonElement = document.getElementById('dashboard-button');
        if (dashboardButtonElement) {
            dashboardButtonElement.innerHTML = dashboardButtonHTML;
        }
    } catch (error) {
        console.error("[ERR] Failed to load the dashboard button: ", error);
    }
});
