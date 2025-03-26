import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import { OPENWEATHER_API_KEY } from "@env";

const WeatherScreenDetail = ({ route }) => {
    const { roadName, latitude, longitude } = route.params;
    const [hourlyForecast, setHourlyForecast] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const url = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`;

                const response = await axios.get(url);

                if (response.data.list) {
                    const now = new Date();

                    const filteredData = response.data.list.filter(item => {
                        const forecastTime = new Date(item.dt_txt);
                        return forecastTime > now && item.dt_txt.includes(":00:00"); // 🔥 SADECE GELECEK SAATLER
                    });

                    setHourlyForecast(filteredData);
                } else {
                    console.error("🚨 API saatlik hava durumu verisi döndürmedi.");
                }
            } catch (error) {
                console.error("🚨 Hava durumu alınırken hata oluştu: ", error);
            }
            setLoading(false);
        };

        fetchWeather();
    }, []);

    return (
            <View style={styles.container}>
                <Text style={styles.title}>{roadName} İçin Saatlik Hava Durumu</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : hourlyForecast.length > 0 ? (
                    <FlatList
                        data={hourlyForecast}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.item}>
                                <Text>📅 Tarih: {item.dt_txt.split(" ")[0]}</Text>
                                <Text>⏰ Saat: {item.dt_txt.split(" ")[1]}</Text>
                                <Text>🌡 Sıcaklık: {item.main.temp}°C</Text>
                                <Text>☁️ Hava Durumu: {item.weather[0].description}</Text>
                            </View>
                        )}
                    />
                ) : (
                    <Text style={styles.noData}>⚠️ Saatlik hava durumu bilgisi bulunamadı!</Text>
                )}
            </View>


    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "transparent", // 👈 Arka planı saydam yaptık
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#000", // görünür olması için net renk
    },
    item: {
        padding: 10,
        backgroundColor: "rgba(255, 255, 255, 0.8)", // 👈 Hafif opak kutu
        borderRadius: 8,
        marginBottom: 10,
    },
    noData: {
        textAlign: "center",
        fontSize: 16,
        color: "red",
        marginTop: 20,
    },
});

export default WeatherScreenDetail;