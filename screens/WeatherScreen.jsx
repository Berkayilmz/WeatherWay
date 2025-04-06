import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { OPENWEATHER_API_KEY } from "@env";

const WeatherScreen = ({ route, navigation }) => {
  const { routeData, startCity, endCity } = route.params || {};
  const [weatherData, setWeatherData] = useState({});

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const newWeatherData = {};

        for (const item of routeData) {
          const url = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${item.latitude}&lon=${item.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`;
          const response = await axios.get(url);
          const forecastList = response.data?.list || [];

          const targetTime = new Date(item.formattedArrivalTime);
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
            const visibility = closestForecast.visibility || 10000;
            let fogLevel = "";
            if (visibility < 200) fogLevel = "Yoğun Sis";
            else if (visibility < 500) fogLevel = "Sisli";
            else if (visibility < 2000) fogLevel = "Hafif Sis";

            newWeatherData[item.name + item.formattedArrivalTime] = {
              temp: closestForecast.main.temp,
              description: closestForecast.weather[0].description,
              windSpeed: closestForecast.wind?.speed || 0,
              fogLevel,
              dt_txt: closestForecast.dt_txt,
            };
          } else {
            newWeatherData[item.name + item.formattedArrivalTime] = null;
          }
        }

        setWeatherData(newWeatherData);
      } catch (error) {
        console.error("🚨 Hava durumu alınırken hata:", error);
      }
    };

    if (routeData.length > 0) {
      fetchWeatherData();
    }
  }, [routeData]);

  if (!routeData || routeData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          ⚠️ Rota üzerindeki hava durumu verisi bulunamadı!
        </Text>
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
          const timeString = arrivalDate.toTimeString().slice(0, 5);
          const dateString = `${arrivalDate.getDate().toString().padStart(2, "0")}.${(arrivalDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}.${arrivalDate.getFullYear()}`;

          const weatherKey = item.name + item.formattedArrivalTime;
          const weather = weatherData[weatherKey];

          return (
            <View style={styles.item}>
              <Text style={styles.roadTitle}>📍 Yol: {item.name}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text>⏰ Tahmini Varış: {timeString}</Text>
                <Text>📅 {dateString}</Text>
              </View>
              <Text>⏱️ Toplam Varış Süresi: {item.formattedCumulativeDuration}</Text>

              {weather ? (
                <>
                  <Text style={{ fontWeight: "bold" }}>🌡 Sıcaklık: {Math.round(weather.temp)}°C</Text>
                  <Text style={{ fontWeight: "bold" }}>☁️ Hava Durumu: {weather.description}</Text>
                  {weather.fogLevel && (
                    <Text style={{ fontWeight: "bold", color: "#555" }}>
                      🌫️ {weather.fogLevel}
                    </Text>
                  )}
                  <Text style={{ fontWeight: "bold" }}>🌬️ Rüzgar: {weather.windSpeed} m/s</Text>
                </>
              ) : (
                <ActivityIndicator />
              )}

              <View style={styles.buttonContainer}>
                <Button
                  title="Detayları Gör"
                  onPress={() =>
                    navigation.navigate("WeatherScreenDetail", {
                      roadName: item.name,
                      latitude: item.latitude,
                      longitude: item.longitude,
                    })
                  }
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  roadTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  item: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D3D3D3",
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
    textAlign: "center",
  },
});

export default WeatherScreen;