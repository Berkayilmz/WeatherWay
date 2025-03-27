import React, { useState, useEffect } from "react";
import { View, Button, StyleSheet, Alert, SafeAreaView, StatusBar, Platform } from "react-native";
import CustomMap from "../src/components/CustomMap";
import CityTextInput from "../src/components/CityTextInput";
import axios from "axios";

const HomeScreen = ({ navigation }) => {
    const [startCity, setStartCity] = useState("");
    const [endCity, setEndCity] = useState("");
    const [startCoords, setStartCoords] = useState(null);
    const [endCoords, setEndCoords] = useState(null);
    const [routeData, setRouteData] = useState([]);
    const [isRouteReady, setIsRouteReady] = useState(false);

    useEffect(() => {
        setIsRouteReady(!!(startCoords && endCoords));
    }, [startCoords, endCoords]);

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
                {/* Inputları yan yana */}
                <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                        <CityTextInput city={startCity} setCity={setStartCity} placeholder="Başlangıç Şehri" />
                    </View>
                    <View style={styles.inputWrapper}>
                        <CityTextInput city={endCity} setCity={setEndCity} placeholder="Varış Şehri" />
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button title="Rota Oluştur" onPress={handleCreateRoute} />
                </View>

                <View style={styles.mapContainer}>
                    <CustomMap
                        startCoords={startCoords}
                        endCoords={endCoords}
                        setRouteData={setRouteData}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="GÜZERGAHLARI GÖSTER"
                        onPress={() =>
                            navigation.navigate("WeatherScreen", { routeData, startCity, endCity })
                        }
                        disabled={!isRouteReady}
                    />
                    <Button
                        title="YOL DURUMU"
                        onPress={() => navigation.navigate("RoadCondition")}
                    />
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
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
    },
    mapContainer: { flex: 6 },
    activityIndicatorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default HomeScreen;