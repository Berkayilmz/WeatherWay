import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  Text
} from "react-native";
import CustomMap from "../src/components/CustomMap";
import CityTextInput from "../src/components/CityTextInput";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from "axios";

const HomeScreen = ({ navigation }) => {
  const [startCity, setStartCity] = useState("");
  const [endCity, setEndCity] = useState("");
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routeData, setRouteData] = useState([]);
  const [isRouteReady, setIsRouteReady] = useState(false);
  const [departureTime, setDepartureTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    setIsRouteReady(!!(startCoords && endCoords));
  }, [startCoords, endCoords]);

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

        {/* Saat seçimi */}
        <View style={styles.buttonContainer}>
          <Button
            title={departureTime ? `Çıkış Saati: ${departureTime}` : "Çıkış Saati Seç"}
            onPress={() => setShowTimePicker(true)}
          />
          <DateTimePickerModal
            isVisible={showTimePicker}
            mode="time"
            onConfirm={handleTimeConfirm}
            onCancel={() => setShowTimePicker(false)}
            is24Hour={true}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Rota Oluştur" onPress={handleCreateRoute} />
        </View>

        <View style={styles.mapContainer}>
          <CustomMap
            startCoords={startCoords}
            endCoords={endCoords}
            setRouteData={setRouteData}
            departureTime={departureTime}
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
                departureTime,
              })
            }
            disabled={!isRouteReady}
          />
          {/* 
                    ----------- YOL ÇALIŞMALARI VE YOL DURUMLARI EKLENECEK -------------
          <Button title="YOL DURUMU" onPress={() => navigation.navigate("RoadCondition")} /> 
          */}
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
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingBottom: 5,
    justifyContent: "center",
  },
  inputWrapper: {
    flex: 1,
  },
  buttonContainer: {
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    flexDirection: "column",
    gap: 10,
    justifyContent: "center",
  },
  mapContainer: { flex: 6 },
});

export default HomeScreen;