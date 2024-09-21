const express = require('express');
const path = require('path');
const router = express.Router();

// Unauthorized
router.get('/401', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html/http_codes/unauthorized.html'));
});

// Forbidden
router.get('/403', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html/http_codes/forbidden.html'));
});

// Not Found
router.get('/404', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html/http_codes/notFound.html'));
});

// Internal Server Error
router.get('/500', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html/http_codes/internalServerError.html'));
});

module.exports = router;
