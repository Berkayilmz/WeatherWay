import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";

const API_KEY = "e08aec03bff4306713ccb906ffdc971f"; // OpenWeather API anahtarını ekle

const WeatherScreen = ({ route, navigation }) => {
    const { routeData, startCity, endCity } = route.params || {}; // Gelen şehir bilgileri alındı
    const [weatherData, setWeatherData] = useState({});
    const [startCityWeather, setStartCityWeather] = useState(null);
    const [endCityWeather, setEndCityWeather] = useState(null);

    console.log("Başlangıç Şehri:", startCity);
    console.log("Varış Şehri:", endCity);

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
                console.error("🚨 Rota üzerindeki hava durumu alınırken hata oluştu: ", error);
            }
        };

        const fetchStartEndCityWeather = async () => {
            try {
                if (startCity) {
                    const startResponse = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?q=${startCity}&appid=${API_KEY}&units=metric&lang=tr`
                    );
                    setStartCityWeather(startResponse.data);
                }

                if (endCity) {
                    const endResponse = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?q=${endCity}&appid=${API_KEY}&units=metric&lang=tr`
                    );
                    setEndCityWeather(endResponse.data);
                }
            } catch (error) {
                console.error("🚨 Başlangıç veya varış şehirlerinin hava durumu alınırken hata oluştu: ", error);
            }
        };

        if (routeData.length > 0) {
            fetchWeatherData();
            fetchStartEndCityWeather();
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
            <Text style={styles.title}>🌍 Rota Üzerindeki Hava Durumu</Text>

            {/* Başlangıç Şehri Hava Durumu */}
            {startCityWeather && (
                <TouchableOpacity
                    style={styles.weatherBox}
                    onPress={() => {
                        navigation.navigate("CityWeatherDetailScreen", {
                            city: startCity
                        });
                    }}
                >
                    <Text style={styles.weatherTitle}>🚀 Başlangıç: {startCity}</Text>
                    <Text>🌡 Sıcaklık: {startCityWeather.main.temp}°C</Text>
                    <Text>☁️ Hava Durumu: {startCityWeather.weather[0].description}</Text>
                </TouchableOpacity>
            )}

            {/* Rota Üzerindeki Yolların Listesi */}
            <FlatList
                data={routeData}
                keyExtractor={(item, index) => index.toString()}
                style={styles.flatListStyle}
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
                        <Text>📍 Yol: {item.name || "Bilinmeyen Yol"}</Text>
                        <Text>📍 Koordinatlar: {item.latitude}, {item.longitude}</Text>
                        <Text>🕒 Tahmini Varış Süresi: {Math.floor(item.duration / 3600)} Saat - {Math.floor((item.duration % 3600) / 60)} Dakika</Text>
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
                // 🔥 Liste sonunda ekstra boşluk bırakıyoruz
                ListFooterComponent={<View style={styles.footerSpacing} />}
            />

            {/* Varış Şehri Hava Durumu */}
            {endCityWeather && (
                <TouchableOpacity
                    style={[styles.weatherBox, styles.arrivalBox]} // 🔥 Buraya marginTop ekledik
                    onPress={() => {
                        navigation.navigate("CityWeatherDetailScreen", {
                            city: endCity,
                        });
                    }}
                >
                    <Text style={styles.weatherTitle}>🏁 Varış: {endCity}</Text>
                    <Text>🌡 Sıcaklık: {endCityWeather.main.temp}°C</Text>
                    <Text>☁️ Hava Durumu: {endCityWeather.weather[0].description}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
    item: { padding: 15, backgroundColor: "#fff", borderRadius: 8, marginBottom: 10 },
    weatherBox: {
        backgroundColor: "#fff",
        padding: 15,
        marginBottom: 15,
        borderRadius: 8,
        alignItems: "center",
        padding: 10,
        borderWidth: 2,
        borderColor: "#D3D3D3",
    },
    weatherTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
    flatListStyle: { borderWidth: 2, padding: 10, borderRadius: 10, borderColor: "#D3D3D3" },
    footerSpacing: { height: 30 }, // 🔥 Altta boşluk bırakıyoruz
    arrivalBox: { marginTop: 20 }, // 🔥 Varış Şehri ile liste arasına boşluk ekledik
});

export default WeatherScreen;
