define({
    getFormattedCity: (weatherData) => {
        return weatherData.city + " en " + weatherData.country;
    }
});
