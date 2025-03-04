import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";

const API_KEY = "e08aec03bff4306713ccb906ffdc971f"; // OpenWeather API anahtarını ekle

const WeatherScreen = ({ route, navigation }) => {
    const { routeData } = route.params || {};
    const [weatherData, setWeatherData] = useState({});

    console.log(routeData);

    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                const newWeatherData = {};
                for (const item of routeData) {
                    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${item.latitude}&lon=${item.longitude}&appid=${API_KEY}&units=metric&lang=tr`;
                    const response = await axios.get(url);
                    newWeatherData[item.name] = response.data;
                }
                setWeatherData(newWeatherData);
            } catch (error) {
                console.error("🚨 Hava durumu verisi alınırken hata oluştu: ", error);
            }
        };
        
        if (routeData.length > 0) {
            fetchWeatherData();
        }
    }, [routeData]);


    if (!routeData || routeData.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>⚠️ Rota üzerindeki hava durumu verisi bulunamadı!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rota Üzerindeki Yollar</Text>
            <FlatList
                data={routeData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => {
                            navigation.navigate("WeatherScreenDetail", {
                                roadName: item.name,
                                latitude: item.latitude,
                                longitude: item.longitude,
                            });
                        }}
                    >
                        <Text>📍 Yol: {item.name}</Text>
                        <Text>📍 Koordinatlar: {item.latitude}, {item.longitude}</Text>
                        <Text>🕒 Tahmini Varış Süresi: {Math.floor(item.duration / 3600)} Saat - {Math.floor((item.duration % 3600) / 60)} Dakika Dakika</Text>
                        <Text>⏰ Tahmini Varış Saati: {item.formattedArrivalTime}</Text>
                        {weatherData[item.name] ? (
                            <>
                                <Text>🌡 Sıcaklık: {weatherData[item.name].main.temp}°C</Text>
                                <Text>☁️ Hava Durumu: {weatherData[item.name].weather[0].description}</Text>
                            </>
                        ) : (
                            <Text>🔄 Hava durumu yükleniyor...</Text>
                        )}
                        <Text>⏩ Detayları Görmek İçin Tıklayın</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
    item: { padding: 15, backgroundColor: "#fff", borderRadius: 8, marginBottom: 10 },
});

export default WeatherScreen;