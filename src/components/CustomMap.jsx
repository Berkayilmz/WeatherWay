import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import axios from "axios";

const OPENWEATHER_API_KEY = "e08aec03bff4306713ccb906ffdc971f"; 

const CustomMap = ({ startCoords, endCoords, setWeatherData }) => {
    const [routeCoords, setRouteCoords] = useState([]);

    useEffect(() => {
        if (!startCoords || !endCoords) {
            console.log("⏳ Koordinatlar bekleniyor...");
            return; // Eğer koordinatlar girilmemişse rota çizme
        }

        console.log("📍 Güncellenen Koordinatlar:", startCoords, endCoords);

        const fetchRoute = async () => {
            try {
                console.log("🚀 Rota isteği yapılıyor...");

                const OSRM_URL = `https://router.project-osrm.org/route/v1/driving/${startCoords.longitude},${startCoords.latitude};${endCoords.longitude},${endCoords.latitude}?overview=full&geometries=geojson&steps=true`;

                const response = await axios.get(OSRM_URL);

                if (!response.data.routes || response.data.routes.length === 0) {
                    console.log("❌ OSRM API'den geçerli bir rota verisi alınamadı!");
                    return;
                }

                console.log("✅ Rota başarıyla alındı!");

                const route = response.data.routes[0];
                const coordinates = route.geometry.coordinates;

                const mappedCoords = coordinates.map((coord) => ({
                    latitude: coord[1],
                    longitude: coord[0],
                }));

                setRouteCoords(mappedCoords);
                fetchWeatherData(route.legs); // 🔥 Hata buradaydı! Şimdi tanımlandı.
            } catch (error) {
                console.error("🚨 Rota bilgisi getirilirken hata oluştu: ", error);
            }
        };

        fetchRoute();
    }, [startCoords, endCoords]);

    // **Hava Durumu Verisini Getiren Fonksiyon**
    const fetchWeatherData = async (legs) => {
        try {
            if (!legs || legs.length === 0) {
                console.log("⚠️ Hava durumu almak için uygun `legs` verisi bulunamadı!");
                return;
            }

            const routeMap = new Map();

            // 📌 Yol isimlerini grupluyoruz
            legs.forEach((leg) => {
                if (!leg.steps || leg.steps.length === 0) {
                    console.log("⚠️ `steps` verisi eksik, geçiliyor...");
                    return;
                }

                leg.steps.forEach((step) => {
                    if (!step.maneuver || !step.maneuver.location) {
                        console.log("⚠️ `maneuver.location` verisi eksik, geçiliyor...");
                        return;
                    }

                    const name = step.name && step.name.trim() !== "" ? step.name : "İsimsiz Yol";
                    const [lon, lat] = step.maneuver.location;

                    if (!routeMap.has(name)) {
                        routeMap.set(name, { count: 0, totalLat: 0, totalLon: 0 });
                    }

                    const data = routeMap.get(name);
                    data.count += 1;
                    data.totalLat += lat;
                    data.totalLon += lon;
                });
            });

            let weatherDataList = [];

            // 📌 Ortalama koordinatları hesaplıyoruz
            for (const [name, data] of routeMap.entries()) {
                const avgLat = data.totalLat / data.count;
                const avgLon = data.totalLon / data.count;

                const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${avgLat}&lon=${avgLon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`;
                try {
                    const response = await axios.get(weatherURL);
                    weatherDataList.push({
                        name,
                        city: response.data.name || "Bilinmeyen",
                        temp: response.data.main.temp,
                        condition: response.data.weather[0].description,
                        latitude: avgLat,
                        longitude: avgLon,
                    });
                } catch (weatherError) {
                    console.error(`❌ Hava durumu alınırken hata oluştu (${name}):`, weatherError);
                }
            }

            setWeatherData(weatherDataList);
        } catch (error) {
            console.error("🚨 Hava durumu alınırken hata oluştu: ", error);
        }
    };

    return (
        <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
                latitude: startCoords ? startCoords.latitude : 39.9208, // Türkiye'nin merkezi
                longitude: startCoords ? startCoords.longitude : 32.8541,
                latitudeDelta: 5,
                longitudeDelta: 5,
            }}
        >
            {startCoords && <Marker coordinate={startCoords} title="Başlangıç Noktası" />}
            {endCoords && <Marker coordinate={endCoords} title="Varış Noktası" />}
            {routeCoords.length > 0 && (
                <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
            )}
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        width: "100%",
        height: "100%",
    },
});

export default CustomMap;
