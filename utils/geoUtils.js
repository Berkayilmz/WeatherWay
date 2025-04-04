import axios from "axios";

export const fetchCoordinates = async (city) => {
  if (!city.trim()) throw new Error("Lütfen bir şehir girin!");

  const url = `https://nominatim.openstreetmap.org/search?q=${city}&format=json`;
  const response = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (response.data.length === 0) {
    throw new Error(`${city} için koordinat bulunamadı!`);
  }

  const { lat, lon } = response.data[0];
  return {
    latitude: parseFloat(lat),
    longitude: parseFloat(lon),
  };
};