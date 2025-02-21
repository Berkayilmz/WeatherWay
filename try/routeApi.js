const axios = require("axios");

const START_LAT = "40.5698389";
const START_LON = "34.7269292";
const END_LAT = "37.9465412";
const END_LON = "30.9602093";

const OSRM_URL = `https://router.project-osrm.org/route/v1/driving/${START_LON},${START_LAT};${END_LON},${END_LAT}?overview=full&geometries=geojson`;

const getRoute = async () => {
    try {
        const response = await axios.get(OSRM_URL);
        console.log("Rota Mesafesi: ", response.data.routes[0].distance / 1000, "km");
        console.log("Tahmini Süre: ", response.data.routes[0].duration / 60, "dk");
    } catch (error) {
        console.log("Hata: ", error);
    }
};

getRoute();