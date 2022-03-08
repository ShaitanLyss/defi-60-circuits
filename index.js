// Consts
const changeCityIntervalInSeconds = 30;
const server_port = 12000;

// Server setup
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

// Random city setup
const sample = require('lodash.sample');
const axios = require("axios").default;
const fs = require('fs');
const cities = require('cities-with-1000');
const citiesLines = fs.readFileSync(cities.file, 'utf8').split('\n');
let currentWeatherData;


// Page content
app.get('/', (req, res) => {
    res.render('index');
});


/**
 * Returns a random city and country code.
 */
function getRandomCity() {
    let res = {};
    const data = sample(citiesLines).split('\t');
    cities.fields.forEach((key, i) => res[key] = data[i]);

    return res;
}


/**
 * Changes the displayed weather to a random city.
 */
function changeDisplayedCityWeather() {
    const cityData = getRandomCity();

    // options for axios request
    const options = {
        method: 'GET',
        url: 'https://yahoo-weather5.p.rapidapi.com/weather',
        params: {lat: cityData.lat, long: cityData.lon, format: 'json', u: 'c'},
        headers: {
            'x-rapidapi-host': 'yahoo-weather5.p.rapidapi.com',
            'x-rapidapi-key': 'd5438c54a8mshd961ce86050ec55p1ca751jsna86159793f2f'
        }
    };

    // axios request to get weather data
    axios.request(options).then(function (response) {
        console.log("now displaying weather for " + response.data.location.city + " in " + response.data.location.country);
        currentWeatherData = response.data;
        io.emit('change city', JSON.stringify(response.data));

    }).catch(function (error) {
        console.error(error);
    });
}

// Initialization
changeDisplayedCityWeather();
// Set the city change to occur every x seconds
setInterval(changeDisplayedCityWeather,
    changeCityIntervalInSeconds * 1000);


// Server start
server.listen(server_port, () => {
    console.log('listening on *:' + server_port);
})