import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator } from "react-native";
import axios from "axios";
import { OPENWEATHER_API_KEY } from '@env';

const WeatherScreen = ({ route, navigation }) => {
    const { routeData, startCity, endCity } = route.params || {};
    const [weatherData, setWeatherData] = useState({});
    const [startCityCoords, setStartCityCoords] = useState(null);
    const [endCityCoords, setEndCityCoords] = useState(null);
    const [startCityWeather, setStartCityWeather] = useState(null);
    const [endCityWeather, setEndCityWeather] = useState(null);

    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                const newWeatherData = {};

                for (const item of routeData) {
                    const url = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${item.latitude}&lon=${item.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`;
                    const response = await axios.get(url);
                    const forecastList = response.data?.list || [];

                    const targetTime = new Date(item.formattedArrivalTime);
                    // console.log(targetTime);
                    let closestForecast = null;
                    let smallestDiff = Infinity;

                    for (const forecast of forecastList) {
                        const forecastTime = new Date(forecast.dt_txt);
                        const timeDiff = Math.abs(forecastTime - targetTime);

                        if (timeDiff < smallestDiff) {
                            smallestDiff = timeDiff;
                            closestForecast = forecast;
                        }
                    }

                    if (closestForecast) {
                        newWeatherData[item.name] = {
                            temp: closestForecast.main.temp,
                            description: closestForecast.weather[0].description,
                            dt_txt: closestForecast.dt_txt
                        };
                    } else {
                        newWeatherData[item.name] = null;
                    }
                }

                setWeatherData(newWeatherData);
            } catch (error) {
                console.error("🚨 PRO API'den hava durumu alınırken hata oluştu: ", error);
            }
        };

        const fetchCityData = async () => {
            try {
                if (startCity) {
                    const startResponse = await axios.get(
                        `http://api.openweathermap.org/data/2.5/weather?q=${startCity}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`
                    );
                    setStartCityWeather(startResponse.data);
                    setStartCityCoords({
                        latitude: startResponse.data.coord.lat,
                        longitude: startResponse.data.coord.lon,
                    });
                }

                if (endCity) {
                    const endResponse = await axios.get(
                        `http://api.openweathermap.org/data/2.5/weather?q=${endCity}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`
                    );
                    setEndCityWeather(endResponse.data);
                    setEndCityCoords({
                        latitude: endResponse.data.coord.lat,
                        longitude: endResponse.data.coord.lon,
                    });
                }
            } catch (error) {
                console.error("🚨 Şehir hava durumu alınırken hata oluştu: ", error);
            }
        };

        if (routeData.length > 0) {
            fetchWeatherData();
            fetchCityData();
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

            <FlatList
                data={routeData}
                keyExtractor={(item, index) => index.toString()}
                style={styles.flatListStyle}
                renderItem={({ item }) => {
                    const arrivalDate = new Date(item.formattedArrivalTime);
                    const timeString = arrivalDate.toTimeString().slice(0, 5); // HH:mm
                    const dateString = `${arrivalDate.getDate().toString().padStart(2, "0")}.${(arrivalDate.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}.${arrivalDate.getFullYear()}`; // dd.mm.yyyy

                    const totalMinutes = Math.floor(item.duration / 60);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    const formattedDuration =
                        hours > 0
                            ? `${hours} Saat${minutes > 0 ? ` - ${minutes} Dakika` : ""}`
                            : `${minutes} Dakika`;

                    return (
                        <View style={styles.item}>
                            <Text style={styles.roadTitle}>📍 Yol: {item.name || "Bilinmeyen Yol"}</Text>
                            {/* <Text>📍 Koordinatlar: {item.latitude}, {item.longitude}</Text> */}
                            <Text>🕒 Tahmini Varış Süresi: {formattedDuration}</Text>
                            <Text>⏰ Tahmini Varış Saati: {timeString}</Text>
                            <Text>📅 Varış Günü: {dateString}</Text>

                            {weatherData[item.name] ? (
                                <>
                                    <Text style={{fontWeight:"bold"}}>🌡 Sıcaklık: {weatherData[item.name].temp}°C</Text>
                                    <Text style={{fontWeight:"bold"}}>☁️ Hava Durumu: {weatherData[item.name].description}</Text>
                                </>
                            ) : (
                                <ActivityIndicator />
                            )}

                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Hava Durumu"
                                    onPress={() => navigation.navigate("WeatherScreenDetail", {
                                        roadName: item.name,
                                        latitude: item.latitude,
                                        longitude: item.longitude,
                                    })}
                                    color="#007BFF"
                                />
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
    roadTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
    item: {
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#D3D3D3"
    },
    flatListStyle: { marginBottom: 20 },
    buttonContainer: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    errorText: {
        fontSize: 16,
        color: "red",
        textAlign: "center"
    }
});

export default WeatherScreen;