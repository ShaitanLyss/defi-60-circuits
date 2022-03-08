// Server setup
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

// Page content
app.get('/', (req, res) => {
    res.send("<h1>Weather report</h1>");
});




// Server start
const server_port = 12000
server.listen(server_port, () => {
    console.log('listening on *:' + server_port);
})