import React, { useEffect, useState } from "react";
import { View, Text, SectionList, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import { OPENWEATHER_API_KEY } from '@env';

const CityWeatherDetailScreen = ({ route }) => {
    const { city } = route.params || {};
    const [groupedForecast, setGroupedForecast] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                // 🔥 Önce şehir koordinatlarını al
                const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_API_KEY}`;
                const geoResponse = await axios.get(geoUrl);

                if (geoResponse.data.length === 0) {
                    console.error("🚨 Şehir bulunamadı!");
                    return;
                }

                const { lat, lon } = geoResponse.data[0];

                // 🔥 Saatlik hava durumu verisini çekelim (PRO API Gerektirir)
                const url = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`;
                const response = await axios.get(url);

                // 🔥 Gelen hava durumu verisini günlere göre gruplayalım
                const forecastList = response.data.list;
                const groupedData = {};

                forecastList.forEach(item => {
                    const date = item.dt_txt.split(" ")[0]; // 🔥 Tarihi al (YYYY-MM-DD)
                    if (!groupedData[date]) {
                        groupedData[date] = [];
                    }
                    groupedData[date].push({
                        saat: item.dt_txt.split(" ")[1], // 🔥 Saat bilgisini al
                        sıcaklık: item.main.temp,
                        hava: item.weather[0].description
                    });
                });

                // 🔥 Veriyi `SectionList` için uygun hale getiriyoruz
                const sectionListData = Object.entries(groupedData).map(([date, data]) => ({
                    title: date,
                    data
                }));

                setGroupedForecast(sectionListData);
                setLoading(false);

            } catch (error) {
                console.error("🚨 Hava durumu çekilirken hata oluştu:", error.message);
                setLoading(false);
            }
        };

        fetchWeatherData();
    }, [city]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📍 {city} İçin Saatlik Hava Durumu</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#3498db" />
            ) : (
                <SectionList
                    sections={groupedForecast}
                    keyExtractor={(item, index) => index.toString()}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.dateHeader}>
                            <Text style={styles.dateText}>📅 {title}</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <View style={styles.forecastItem}>
                            <Text style={styles.timeText}>⏰ {item.saat}</Text>
                            <Text style={styles.tempText}>🌡 {item.sıcaklık}°C</Text>
                            <Text style={styles.weatherText}>☁ {item.hava}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default CityWeatherDetailScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
    dateHeader: {
        backgroundColor: "#3498db",
        padding: 10,
        borderRadius: 5,
        marginTop: 10
    },
    dateText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
    forecastItem: {
        padding: 10,
        backgroundColor: "#fff",
        marginBottom: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#D3D3D3",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    timeText: { fontSize: 16, fontWeight: "bold" },
    tempText: { fontSize: 16, color: "red" },
    weatherText: { fontSize: 16, fontStyle: "italic" }
});
