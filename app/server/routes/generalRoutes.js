const express = require('express');
const path = require('path');
const router = express.Router();

// Dashboard
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html/general/dashboard.html'));
});

module.exports = router;