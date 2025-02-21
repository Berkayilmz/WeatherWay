const axios = require("axios");

const API_KEY = "182cd635f2a526257126b64bab5ec7cb";
const CITY = "Isparta";

const getWeather = async (city) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await axios.get(url);

        console.log("Şehir: ", response.data.name);
        console.log("Sıcaklık: ", response.data.main.temp, "°C");
        console.log("Hava Durumu: ", response.data.weather[0].description);
    } catch (error) {
        console.log("Hata: ", error);
    }
}

getWeather(CITY);