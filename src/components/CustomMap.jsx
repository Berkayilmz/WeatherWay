import React, { useEffect, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import axios from "axios";

const OPENWEATHER_API_KEY = "96ce9bbd247d1d4ce850024c82d6047f";

const CustomMap = () => {
    const [routeCoords, setRouteCoords] = useState([]);
    const [weatherData, setWeatherData] = useState([]);
    const startLocation = { latitude: 40.5498762, longitude: 34.9537362 }; // Çorum
    const endLocation = { latitude: 37.7709545, longitude: 30.5512931 }; // Isparta

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const OSRM_URL = `https://router.project-osrm.org/route/v1/driving/${startLocation.longitude},${startLocation.latitude};${endLocation.longitude},${endLocation.latitude}?overview=full&geometries=geojson`;

                const response = await axios.get(OSRM_URL);

                if (response.data.routes.length > 0) {
                    const coordinates = response.data.routes[0].geometry.coordinates;

                    // OSM formatındaki koordinatları React Native Maps formatına dönüştürme
                    const mappedCoords = coordinates.map((coord) => ({
                        latitude: coord[1],
                        longitude: coord[0],
                    }));

                    setRouteCoords(mappedCoords);
                    fetchWeatherData(mappedCoords)
                } else {
                    console.log("OSRM API'den geçerli bir rota verisi gelmedi!");
                }
            } catch (error) {
                console.error("Rota bilgisi getirilirken hata oluştu: ", error);
            }
        };

        fetchRoute();
    }, []);


    const fetchWeatherData = async (coordinates) => {
        try {
            if (!coordinates || coordinates.length === 0) {
                console.log("Hata: Koordinat dizisi boş!");
                return;
            }

            let weatherPoints = [];
            for (let i = 0; i < coordinates.length; i += 50) { // Her 10 noktada bir hava durumu al
                if (!coordinates[i]) {
                    console.log(`Hata: coordinates[${i}] undefined!`); // Hangi noktada hata olduğunu görmek için
                    continue;
                }

                const { latitude, longitude } = coordinates[i];

                const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;

                const response = await axios.get(weatherURL);
                weatherPoints.push({
                    latitude,
                    longitude,
                    temp: response.data.main.temp,
                    condition: response.data.weather[0].description,
                });
            }
            setWeatherData(weatherPoints);
        } catch (error) {
            console.error("Hava durumu alınırken hata oluştu: ", error);
        }
    };



    return (

            <MapView
                provider={PROVIDER_DEFAULT} // OpenStreetMap kullanımı için
                style={styles.map}
                initialRegion={{
                    latitude: (startLocation.latitude + endLocation.latitude) / 2,
                    longitude: (startLocation.longitude + endLocation.longitude) / 2, // HATA DÜZELTİLDİ!
                    latitudeDelta: 2,
                    longitudeDelta: 2,
                }}
            >
                {/* Başlangıç Noktası */}
                <Marker coordinate={startLocation} title="Çorum Merkez" description="Başlangıç Noktası" />

                {/* Varış Noktası */}
                <Marker coordinate={endLocation} title="Isparta Merkez" description="Varış Noktası" />

                {/* Rota Çizgisi */}
                {routeCoords.length > 0 && (
                    <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
                )}

                
            </MapView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: "100%",
        height: "100%",
    },
});

export default CustomMap;
