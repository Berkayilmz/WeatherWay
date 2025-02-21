const axios = require("axios");

const START_LAT = "40.5698389";
const START_LON = "34.7269292";
const END_LAT = "37.9465412";
const END_LON = "30.9602093";

const OSRM_URL = `https://router.project-osrm.org/route/v1/driving/${START_LON},${START_LAT};${END_LON},${END_LAT}?overview=full&geometries=geojson&steps=true`;

const getRoute = async () => {
    try {
        const response = await axios.get(OSRM_URL);
        const route = response.data.routes[0];

        console.log("Rota Mesafesi:", (route.distance / 1000).toFixed(2), "km");
        console.log("Tahmini Süre:", (route.duration / 60).toFixed(2), "dk");

        if (!route.legs || route.legs.length === 0) {
            console.log("Geçilen yerler bilgisi bulunamadı.");
            return;
        }

        console.log("\nGeçilen Yerler:");
        route.legs.forEach((leg, index) => {
            if (!leg.steps || leg.steps.length === 0) {
                console.log(`Segment ${index + 1}: Geçiş bilgisi yok.`);
                return;
            }
            leg.steps.forEach((step, stepIndex) => {
                const name = step.name && step.name.trim() !== "" ? step.name : "İsimsiz Yol";
                const [lon, lat] = step.maneuver.location; // Koordinatları al

                console.log(`${index + 1}.${stepIndex + 1} - ${name} (${lat}, ${lon})`);
            });
        });

    } catch (error) {
        console.log("Hata:", error.message);
    }
};

getRoute();
