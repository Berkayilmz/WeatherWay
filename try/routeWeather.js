const axios = require("axios");

const START_LAT = "40.5698389";
const START_LON = "34.7269292";
const END_LAT = "37.9465412";
const END_LON = "30.9602093";

const OSRM_URL = `https://router.project-osrm.org/route/v1/driving/${START_LON},${START_LAT};${END_LON},${END_LAT}?overview=full&geometries=geojson&steps=true`;
const API_KEY = "e08aec03bff4306713ccb906ffdc971f";

const getWeather = async (lon, lat, name) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=tr`;
        const response = await axios.get(url);

        console.log(`📍 Yol: ${name} (${lat.toFixed(5)}, ${lon.toFixed(5)})`);
        console.log(`🌆 Şehir: ${response.data.name || "Bilinmeyen"}`);
        console.log(`🌡️ Sıcaklık: ${response.data.main.temp}°C`);
        console.log(`☁️ Hava Durumu: ${response.data.weather[0].description}\n`);
    } catch (error) {
        console.error(`(${lat}, ${lon}) konumu için hava durumu alınırken hata:`, error.message);
    }
};

const getRoute = async () => {
    try {
        const response = await axios.get(OSRM_URL);
        const route = response.data.routes[0];

        console.log("🛣️ Rota Mesafesi:", (route.distance / 1000).toFixed(2), "km");
        console.log("⏳ Tahmini Süre:", (route.duration / 60).toFixed(2), "dk\n");

        if (!route.legs || route.legs.length === 0) {
            console.log("❌ Geçilen yerler bilgisi bulunamadı.");
            return;
        }

        console.log("📍 Gruplanmış Geçilen Yerler ve Hava Durumları:");

        const routeMap = new Map();

        for (const leg of route.legs) {
            if (!leg.steps || leg.steps.length === 0) continue;

            for (const step of leg.steps) {
                const name = step.name && step.name.trim() !== "" ? step.name : "İsimsiz Yol";
                const [lon, lat] = step.maneuver.location; // Koordinatları al

                if (!routeMap.has(name)) {
                    routeMap.set(name, { count: 0, totalLat: 0, totalLon: 0 });
                }

                const data = routeMap.get(name);
                data.count += 1;
                data.totalLat += lat;
                data.totalLon += lon;
            }
        }

        for (const [name, data] of routeMap.entries()) {
            const avgLat = data.totalLat / data.count;
            const avgLon = data.totalLon / data.count;

            // Ortalama konuma göre hava durumu al
            await getWeather(avgLon, avgLat, name);
        }
    } catch (error) {
        console.log("❌ Hata:", error.message);
    }
};

getRoute();
