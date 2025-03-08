import axios from "axios";

import { OPENWEATHER_API_KEY } from "@env";

const getWeatherForSpecificTime = async (latitude, longitude, targetTime) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`;
        const response = await axios.get(url);

        if (!response.data || !response.data.list) {
            console.error("❌ Hava durumu verisi bulunamadı!");
            return null;
        }

        const forecasts = response.data.list;

        // 📌 En yakın saat dilimini bul
        let closestForecast = forecasts.reduce((prev, curr) => {
            const prevDiff = Math.abs(new Date(prev.dt_txt) - new Date(targetTime));
            const currDiff = Math.abs(new Date(curr.dt_txt) - new Date(targetTime));
            return currDiff < prevDiff ? curr : prev;
        });

        // 🌦 Hava durumu bilgisini göster
        return {
            time: closestForecast.dt_txt,
            temperature: closestForecast.main.temp,
            weather: closestForecast.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${closestForecast.weather[0].icon}.png`,
        };

    } catch (error) {
        console.error("🚨 OpenWeather API'den veri çekilirken hata oluştu: ", error);
        return null;
    }
};

// 🔥 Kullanım Örneği
const latitude = 37.978165; // İstanbul
const longitude = 30.968055;
const targetTime = "2024-03-02 22:28:59"; // Belirli bir saat

getWeatherForSpecificTime(latitude, longitude, targetTime).then(weather => {
    if (weather) {
        console.log(`📅 En Yakın Zaman: ${weather.time}`);
        console.log(`🌡 Sıcaklık: ${weather.temperature}°C`);
        console.log(`☁️ Hava Durumu: ${weather.weather}`);
        console.log(`🖼 Simge: ${weather.icon}`);
    }
});
