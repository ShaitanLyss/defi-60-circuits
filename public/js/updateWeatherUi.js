require(["js/format"], function (f) {
        const socket = io();

        const cityText = document.getElementById("cityText");

        // add listener to the change city event
        socket.on('change-city', function (weatherData) {
            console.log("New weather data received");
            weatherData = JSON.parse(weatherData);

            // update the city UI
            cityText.textContent = f.getFormattedCity(weatherData);

            // update the weather UI
            for (const [key, value] of Object.entries(weatherData.obs)) {
                const elmnt = document.getElementById(key);
                elmnt.textContent = value;
            }

        });
    },
    function (err) {
        console.error('ERROR : ', err.requireType) ;
        console.error('MODULES : ', err.requireModules) ;
    }
);