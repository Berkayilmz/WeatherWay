import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SectionList,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import axios from "axios";
import { OPENWEATHER_API_KEY } from "@env";

const WeatherScreenDetail = ({ route }) => {
    const { roadName, latitude, longitude } = route.params;
    const [groupedForecast, setGroupedForecast] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const url = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`;

                const response = await axios.get(url);

                if (response.data.list) {
                    const now = new Date();
                    now.setMinutes(0, 0, 0);

                    const filteredData = response.data.list.filter(item => {
                        const forecastTime = new Date(item.dt_txt);
                        return forecastTime >= now && item.dt_txt.includes(":00:00");
                    });

                    const grouped = filteredData.reduce((acc, item) => {
                        const date = item.dt_txt.split(" ")[0];
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(item);
                        return acc;
                    }, {});

                    const sections = Object.entries(grouped).map(([date, data]) => ({
                        title: date,
                        data,
                    }));

                    setGroupedForecast(sections);
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
            ) : groupedForecast.length > 0 ? (
                <SectionList
                    sections={groupedForecast}
                    keyExtractor={(item, index) => index.toString()}
                    renderSectionHeader={({ section: { title } }) => {
                        const [year, month, day] = title.split("-");
                        const formattedDate = `${day}.${month}.${year}`;
                        return (
                            <Text style={styles.dateHeader}>📅 Tarih: {formattedDate}</Text>
                        );
                    }}
                    renderItem={({ item }) => {
                        const time = item.dt_txt.split(" ")[1].slice(0, 5);
                        const visibility = item.visibility || 10000;
                        let fogLevel = "🌫️ Sis Yoğunluğu: Sis Yok";
                        if (visibility < 200) fogLevel = "🌫️ Yoğun Sis";
                        else if (visibility < 500) fogLevel = "🌫️ Sisli";
                        else if (visibility < 2000) fogLevel = "🌫️ Hafif Sis";

                        const windSpeed = item.wind?.speed || 0;

                        return (
                            <View style={styles.item}>
                                <Text>⏰ Saat: {time}</Text>
                                <Text>🌡 Sıcaklık: {item.main.temp}°C</Text>
                                <Text>☁️ Hava Durumu: {item.weather[0].description}</Text>
                                <Text>{fogLevel}</Text>
                                <Text>🌬️ Rüzgar: {windSpeed} m/s</Text>
                            </View>
                        );
                    }}
                />
            ) : (
                <Text style={styles.noData}>
                    ⚠️ Saatlik hava durumu bilgisi bulunamadı!
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "transparent",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#000",
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: "bold",
        backgroundColor: "#ddd",
        padding: 8,
        marginTop: 10,
        borderRadius: 6,
    },
    item: {
        padding: 10,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
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
