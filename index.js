// Config
const cityUpdateIntervalInSeconds = 30;
const server_address = "127.0.0.1";
const server_port = 12000;

// Consts
const MISSING_FILE_ERR = 1
const INVALID_ENV_VAR_ERR = 2;


// Global imports
const fs = require('fs');
const path = require("path");
const requirejs =require('requirejs');
requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});
const format = requirejs("public/js/format");


// Import .env variables
if (!fs.existsSync(".env")) {
    console.error('No .env file, make sure a .env following .env.template has been created');
    process.exit(MISSING_FILE_ERR);
}

require('dotenv-save').config()

if (!process.env.RAPIDAPI_KEY){
    console.error('Missing or invalid variable, make sure .env respects .env.template');
    process.exit(INVALID_ENV_VAR_ERR);
}


// Server setup
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

// Random city setup
const sample = require('lodash.sample');
const axios = require("axios").default;
const countries = require("i18n-iso-countries");
const cities = require('cities-with-1000');
const citiesLines = fs.readFileSync(cities.file, 'utf8').split('\n');
let currentWeatherData = {
    city: "Ville",
    country: "Pays",
    weather: {}
};


// Page content
app.get('/', (req, res) => {
    res.render('index',
        {
            currentWeatherData: currentWeatherData,
            f: format
    });
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
    var options = {
        method: 'GET',
        url: 'https://community-open-weather-map.p.rapidapi.com/weather',
        params: {
            q: '',
            lat: cityData.lat,
            lon: cityData.lon,
            callback: '',
            id: '',
            lang: 'fr',
            units: 'metric',
            mode: ''
        },
        headers: {
            'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY
        }
    };

    // axios request to get weather data
    axios.request(options).then(function (response) {
        currentWeatherData.city = response.data.name;
        currentWeatherData.country = countries.getName(response.data.sys.country, "fr");
        currentWeatherData.obs = {
            "Temps": response.data.weather[0].description,
            "Température": Math.round(response.data.main.temp) + "°C",
            "Ressenti": Math.round(response.data.main.feels_like) + "°C",
            "Humidité": response.data.main.humidity + " %",
            "Vent": (response.data.wind.speed * 3.6).toFixed(2) + " km/h"
        };
        console.log(
            "now displaying weather for " + currentWeatherData.city +
            " in " + countries.getName(response.data.sys.country, "en")
        );
        io.emit('change-city', JSON.stringify(currentWeatherData));

    }).catch(function (error) {
        console.error(error.response.data.message);
    });
}

// Initialization
changeDisplayedCityWeather();
// Set the city change to occur every x seconds
setInterval(changeDisplayedCityWeather,
    cityUpdateIntervalInSeconds * 1000);


// Server start
server.listen(server_port, server_address, () => {
    console.log('listening on ' + server_address + ':' + server_port);
})