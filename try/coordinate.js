const axios = require("axios");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Lütfen bir şehir adı girin: ", async (CITY) => {
    const NOMINATIM_URL = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(CITY)}&format=json`;

    try {
        const response = await axios.get(NOMINATIM_URL);
        if (response.data.length > 0) {
            const { lat, lon, display_name } = response.data[0];
            console.log(`Konum: ${display_name}`);
            console.log(`Enlem: ${lat}, Boylam: ${lon}`);
        } else {
            console.log("Konum Bulunamadı!");
        }
    } catch (error) {
        console.log("Hata: ", error);
    } finally {
        rl.close();
    }
});
