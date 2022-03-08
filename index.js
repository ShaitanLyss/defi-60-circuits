// Consts
const changeCityIntervalInSeconds = 5;
const server_port = 12000;

// Server setup
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);


// Page content
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


/**
 * Changes the displayed weather to a random city.
 */
function changeDisplayedCityWeather() {
    console.log("change displayed city weather");
    io.emit("change city", "weatherData");
}

// Set the city change to occur every x seconds
setInterval(changeDisplayedCityWeather,
    changeCityIntervalInSeconds * 1000);


// Server start
server.listen(server_port, () => {
    console.log('listening on *:' + server_port);
})