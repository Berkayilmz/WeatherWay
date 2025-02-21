import React, { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import CustomMap from "../src/components/CustomMap";

const HomeScreen = ({ navigation }) => {
    const [weatherData, setWeatherData] = useState([]);

    return (
        <View style={styles.container}>
            {/* Harita Bileşeni */}
            <View style={styles.mapContainer}>
                <CustomMap setWeatherData={setWeatherData} />
            </View>

            {/* Hava Durumunu Göster Butonu */}
            <View style={styles.buttonContainer}>
                <Button
                    title="Hava Durumunu Göster"
                    onPress={() => navigation.navigate("WeatherScreen", { weatherData })}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapContainer: {
        flex: 9,
    },
    buttonContainer: {
        flex: 1, // Buton alanı için yer aç
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff", // Butonu görünür hale getirmek için arka plan
        padding: 10,
    },
});

export default HomeScreen;
