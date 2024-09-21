const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { checkAllowedIP } = require('./authUtils');
const obsWebSocketcontroller = require('./obs/obsWebSocketController');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Load Environment Variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });
const port = process.env.PORT || 4545;

app.use(express.static(path.join(__dirname, '../../client')));

//#region ROUTES
app.use('/error', require('../routes/errorRoutes'));
app.use('/g', checkAllowedIP, require('../routes/generalRoutes'));
app.use('/obs', checkAllowedIP, require('../routes/obs/obsRoutes'));

// Auto Redirect
app.get('/', checkAllowedIP, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html/general/index.html'));
});

// robots.txt
app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, '../robots.txt'));
});
//#endregion ROUTES

// Socket.IO
io.on('connection', (socket) => {
    console.log('[SOCK] A client connected:', socket.id);
    socket.emit('obs-status', { connected: obsWebSocketcontroller.isConnected() });

    socket.on('disconnect', () => {
        console.log('[SOCK] Client disconnected:', socket.id);
    });
});

obsWebSocketcontroller.initialize(io);

// Start Server
server.listen(port, () => {
    console.log(`Server is running on Port: ${port}`);
});
