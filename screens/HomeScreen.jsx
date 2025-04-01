// HomeScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  Text,
} from "react-native";
import CustomMap from "../src/components/CustomMap";
import CityTextInput from "../src/components/CityTextInput";
import axios from "axios";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const HomeScreen = ({ navigation }) => {
  const [startCity, setStartCity] = useState("");
  const [endCity, setEndCity] = useState("");
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routeData, setRouteData] = useState([]);
  const [isRouteReady, setIsRouteReady] = useState(false);

  const [travelDate, setTravelDate] = useState(new Date());
  const [departureTime, setDepartureTime] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    setIsRouteReady(!!(startCoords && endCoords));
  }, [startCoords, endCoords]);

  const handleDateConfirm = (date) => {
    setTravelDate(date);
    setShowDatePicker(false);
  };

  const handleTimeConfirm = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    setDepartureTime(`${hours}:${minutes}`);
    setShowTimePicker(false);
  };

  const getCoordinates = async (city, type) => {
    try {
      if (!city.trim()) {
        Alert.alert("Hata", "Lütfen bir şehir girin!");
        return;
      }

      const url = `https://nominatim.openstreetmap.org/search?q=${city}&format=json`;
      const response = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const coords = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        type === "start" ? setStartCoords(coords) : setEndCoords(coords);
      } else {
        Alert.alert("Hata", `${city} için koordinat bulunamadı!`);
      }
    } catch (error) {
      Alert.alert("Hata", `Koordinatlar alınırken hata oluştu: ${city}`);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <CityTextInput city={startCity} setCity={setStartCity} placeholder="Başlangıç Şehri" />
          </View>
          <View style={styles.inputWrapper}>
            <CityTextInput city={endCity} setCity={setEndCity} placeholder="Varış Şehri" />
          </View>
        </View>

        <View style={styles.datetimeRow}>
          <View style={styles.datetimeCard}>
            <Text style={styles.datetimeLabel}>🗓️ Tarih</Text>
            <Button
              title={travelDate.toLocaleDateString("tr-TR")}
              onPress={() => setShowDatePicker(true)}
              color="#007BFF"
            />
          </View>

          <View style={styles.datetimeCard}>
            <Text style={styles.datetimeLabel}>🕒 Saat</Text>
            <Button
              title={departureTime || "Saat Seç"}
              onPress={() => setShowTimePicker(true)}
              color="#007BFF"
            />
          </View>
        </View>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setShowDatePicker(false)}
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 16 * 24 * 60 * 60 * 1000)}
        />

        <DateTimePickerModal
          isVisible={showTimePicker}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={() => setShowTimePicker(false)}
          is24Hour={true}
        />

        <View style={styles.buttonContainer}>
          <Button title="ROTA OLUŞTUR" onPress={handleCreateRoute} color="#007BFF" />
        </View>

        <View style={styles.mapContainer}>
          <CustomMap
            startCoords={startCoords}
            endCoords={endCoords}
            setRouteData={setRouteData}
            departureTime={departureTime}
            travelDate={travelDate}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="GÜZERGAHLARI GÖSTER"
            onPress={() =>
              navigation.navigate("WeatherScreen", {
                routeData,
                startCity,
                endCity,
                travelDate: travelDate.toISOString(),
                departureTime,
              })
            }
            disabled={!isRouteReady}
            color={isRouteReady ? "#007BFF" : "#ccc"}
          />
          <Button title="YOL DURUMU" onPress={() => navigation.navigate("RoadCondition")} color="#007BFF" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#fff",
  },
  container: { flex: 1 },
  inputRow: {
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 10,
    paddingBottom: 5,
    justifyContent: "center",
  },
  inputWrapper: {
    flex: 1,
  },
  datetimeRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    gap: 10,
  },
  datetimeCard: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  datetimeLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
    fontWeight: "600",
  },
  buttonContainer: {
    padding: 10,
    alignItems: "center",
    gap: 10,
  },
  mapContainer: {
    flex: 6,
  },
});

export default HomeScreen;
