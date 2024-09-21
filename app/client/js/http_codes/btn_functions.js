function reload() {
    const urlParams = new URLSearchParams(window.location.search);
    const triggeredBy = urlParams.get('triggeredBy');
    if (triggeredBy) {
        const origin = window.location.origin;
        window.location.href = origin + triggeredBy;
    } else {
        window.location.reload();
    }
}

function back() {
    window.location.href = '/g/dashboard';
}