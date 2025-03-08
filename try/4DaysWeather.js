const axios = require("axios");
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
import { OPENWEATHER_API_KEY } from "@env";

// 🔥 readline'i `async/await` ile çalıştırmak için bir fonksiyon tanımlıyoruz
const askQuestion = (question) => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input, output });
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

const getWeather = async () => {
    try {
        // 🔥 Kullanıcıdan şehir bilgisini al
        const CITY = await askQuestion("Şehir ismi girin: ");

        // 🔥 Önce şehrin koordinatlarını alalım (Saatlik tahmin için koordinat lazım)
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${CITY}&limit=1&appid=${OPENWEATHER_API_KEY}`;
        const geoResponse = await axios.get(geoUrl);

        if (geoResponse.data.length === 0) {
            console.error("🚨 Şehir bulunamadı!");
            return;
        }

        const { lat, lon } = geoResponse.data[0];

        // 🔥 Şimdi saatlik hava durumu verisini çekelim
        const url = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`;
        const response = await axios.get(url);

        // 🔥 Gelen hava durumu verisini gün ve saatlere göre gruplama
        const forecastList = response.data.list;
        const hourlyForecast = {};

        forecastList.forEach(item => {
            const date = item.dt_txt.split(" ")[0]; // 🔥 Sadece günü al (YYYY-MM-DD formatında)
            if (!hourlyForecast[date]) {
                hourlyForecast[date] = [];
            }
            hourlyForecast[date].push({
                saat: item.dt_txt.split(" ")[1], // 🔥 Saat bilgisini al
                sıcaklık: item.main.temp,
                hava: item.weather[0].description
            });
        });

        // 🔥 Ekrana Gün Gün Saatlik Hava Durumu Yazdır
        console.log(`\n📍 ${CITY} İçin Saatlik Hava Durumu:\n`);
        for (const [date, forecasts] of Object.entries(hourlyForecast)) {
            console.log(`📅 Tarih: ${date}`);
            forecasts.forEach(f => {
                console.log(`   ⏰ ${f.saat} - 🌡 ${f.sıcaklık}°C - ☁ ${f.hava}`);
            });
            console.log("--------------------------------");
        }

    } catch (error) {
        console.error("🚨 Hava durumu çekilirken hata oluştu:", error.message);
    }
};

// 🔥 Fonksiyonu çalıştır
getWeather();
