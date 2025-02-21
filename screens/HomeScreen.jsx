import React, { useState, useEffect } from "react";
import { View, Button, StyleSheet, Alert } from "react-native";
import CustomMap from "../src/components/CustomMap";
import CityTextInput from "../src/components/CityTextInput";
import axios from "axios";

const HomeScreen = ({ navigation }) => {
    const [startCity, setStartCity] = useState("");
    const [endCity, setEndCity] = useState("");
    const [startCoords, setStartCoords] = useState(null);
    const [endCoords, setEndCoords] = useState(null);
    const [weatherData, setWeatherData] = useState([]);
    const [isRouteReady, setIsRouteReady] = useState(false); // 🔥 Buton için kontrol

    useEffect(() => {
        if (startCoords && endCoords) {
            setIsRouteReady(true); // Eğer koordinatlar varsa butonu aktif yap
        } else {
            setIsRouteReady(false);
        }
    }, [startCoords, endCoords]); // Koordinatlar değişirse güncellenir

    const getCoordinates = async (city, type) => {
        try {
            if (!city.trim()) {
                Alert.alert("Hata", "Lütfen bir şehir girin!");
                return;
            }

            const url = `https://nominatim.openstreetmap.org/search?q=${city}&format=json`;
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                },
            });

            if (response.data.length > 0) {
                const { lat, lon } = response.data[0];
                const coords = { latitude: parseFloat(lat), longitude: parseFloat(lon) };

                if (type === "start") {
                    setStartCoords(coords);
                } else {
                    setEndCoords(coords);
                }
            } else {
                Alert.alert("Hata", `${city} için koordinat bulunamadı!`);
            }
        } catch (error) {
            Alert.alert("Hata", `Koordinatlar alınırken hata oluştu: ${city}`);
            console.error(`🚨 Koordinatlar alınırken hata oluştu (${city}): `, error);
        }
    };

    const handleCreateRoute = async () => {
        if (!startCity || !endCity) {
            Alert.alert("Hata", "Lütfen iki şehir girin!");
            return;
        }

        await getCoordinates(startCity, "start");
        await getCoordinates(endCity, "end");
    };

    return (
        <View style={styles.container}>
            <CityTextInput city={startCity} setCity={setStartCity} placeholder="Başlangıç şehri" />
            <CityTextInput city={endCity} setCity={setEndCity} placeholder="Varış şehri" />

            <View style={styles.buttonContainer}>
                <Button title="Rota Oluştur" onPress={handleCreateRoute} />
            </View>

            <View style={styles.mapContainer}>
                <CustomMap 
                    startCoords={startCoords} 
                    endCoords={endCoords} 
                    setWeatherData={setWeatherData} 
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Hava Durumunu Göster"
                    onPress={() => navigation.navigate("WeatherScreen", { weatherData })}
                    disabled={!isRouteReady} // 🔥 Eğer rota hazır değilse butonu kapalı tut
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    buttonContainer: {
        padding: 10,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    mapContainer: { flex: 6 },
});

export default HomeScreen;
