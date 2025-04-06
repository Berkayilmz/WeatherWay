import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import axios from "axios";
import { OPENWEATHER_API_KEY } from "@env";
import { SafeAreaView } from "react-native-safe-area-context";

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
            date,
            data,
          }));

          setGroupedForecast(sections);
        }
      } catch (error) {
        console.error("🚨 Hava durumu alınırken hata:", error);
      }
      setLoading(false);
    };

    fetchWeather();
  }, []);

  const renderForecastItem = (item, index) => {
    const time = item.dt_txt.split(" ")[1].slice(0, 5);
    const visibility = item.visibility || 10000;
    let fogLevel = "🌫️ Sis Yoğunluğu: Sis Yok";
    if (visibility < 200) fogLevel = "🌫️ Yoğun Sis";
    else if (visibility < 500) fogLevel = "🌫️ Sisli";
    else if (visibility < 2000) fogLevel = "🌫️ Hafif Sis";
    const windSpeed = item.wind?.speed || 0;
    const feelsLike = item.main.feels_like;
    const rain = item.rain?.["1h"] || 0;
    const snow = item.snow?.["1h"] || 0;

    return (
      <View style={styles.item} key={index}>
        <Text>⏰ Saat: {time}</Text>
        <Text>🌡 Sıcaklık: {item.main.temp}°C</Text>
        <Text>🌡️ Hissedilen: {feelsLike}°C</Text>
        <Text>☁️ Hava Durumu: {item.weather[0].description}</Text>
        <Text>{fogLevel}</Text>
        <Text>🌬️ Rüzgar: {windSpeed} m/s</Text>
        <Text>🌧️ Yağmur: {rain} mm/saat</Text>
        <Text>❄️ Kar: {snow} mm/saat</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{roadName} İçin Saatlik Hava Durumu</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : groupedForecast.length > 0 ? (
        <FlatList
          data={groupedForecast}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => {
            const [year, month, day] = item.date.split("-");
            const formattedDate = `${day}.${month}.${year}`;
            return (
              <View>
                <Text style={styles.dateHeader}>📅 {formattedDate}</Text>
                {item.data.map(renderForecastItem)}
              </View>
            );
          }}
          ListFooterComponent={<View style={{ height: 150 }} />}
        />
      ) : (
        <Text style={styles.noData}>⚠️ Saatlik hava durumu bilgisi bulunamadı!</Text>
      )}
    </SafeAreaView>
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
    fontSize: 16,
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
    marginTop: 5,
  },
  noData: {
    textAlign: "center",
    fontSize: 16,
    color: "red",
    marginTop: 20,
  },
});

export default WeatherScreenDetail;