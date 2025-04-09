import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  Button,
  Keyboard,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import CustomMap from "../src/components/CustomMap";
import CityTextInput from "../src/components/CityTextInput";
import DateTimeSelector from "../src/components/DateTimeSelector";
import LoadingOverlay from "../src/components/LoadingOverlay";

import { fetchCoordinates } from "../utils/geoUtils";

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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsRouteReady(!!(startCoords && endCoords && routeData.length > 0));
  }, [startCoords, endCoords, routeData]);

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

  const handleCreateRoute = async () => {
    Keyboard.dismiss();
    if (!startCity || !endCity) {
      Alert.alert("Hata", "Lütfen iki şehir girin!");
      return;
    }

    setLoading(true);
    try {
      const start = await fetchCoordinates(startCity);
      const end = await fetchCoordinates(endCity);
      setStartCoords(start);
      setEndCoords(end);
    } catch (error) {
      Alert.alert("Hata", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStartCity("");
    setEndCity("");
    setStartCoords(null);
    setEndCoords(null);
    setRouteData([]);
    setIsRouteReady(false);
    setTravelDate(new Date());
    setDepartureTime(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <CityTextInput
              city={startCity}
              setCity={setStartCity}
              placeholder="Başlangıç Şehri"
            />
          </View>
          <View style={styles.inputWrapper}>
            <CityTextInput
              city={endCity}
              setCity={setEndCity}
              placeholder="Varış Şehri"
            />
          </View>
        </View>

        <DateTimeSelector
          travelDate={travelDate}
          departureTime={departureTime}
          onShowDatePicker={() => setShowDatePicker(true)}
          onShowTimePicker={() => setShowTimePicker(true)}
        />

        <View style={styles.buttonContainer}>
          <Button title="ROTA OLUŞTUR" onPress={handleCreateRoute} color="#007BFF" />
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

        <View style={styles.mapContainer}>
          <CustomMap
            startCoords={startCoords}
            endCoords={endCoords}
            setRouteData={setRouteData}
            departureTime={departureTime}
            travelDate={travelDate}
            routeData={routeData}
            onRouteReady={() => setLoading(false)}
          />
        </View>

        <View style={styles.mapOverlayButtons}>
          <Button title="❌" onPress={resetAll} color="red" />
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
            color="#007BFF"
          />
        </View>

        <LoadingOverlay visible={loading} message="Rota yükleniyor..." />
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
  container: {
    flex: 1,
  },
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
  buttonContainer: {
    padding: 10,
    alignItems: "center",
  },
  mapContainer: {
    flex: 6,
  },
  mapOverlayButtons: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    zIndex: 1,
  },
});

export default HomeScreen;
