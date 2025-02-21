import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const WeatherScreen = ({ route }) => {
    const { weatherData } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rota Üzerindeki Hava Durumu</Text>
            <FlatList
                data={weatherData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>📍 Koordinatlar: {item.latitude}, {item.longitude}</Text>
                        <Text>🌡 Sıcaklık: {item.temp}°C</Text>
                        <Text>🌥 Hava Durumu: {item.condition}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    item: {
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 10,
    },
});

export default WeatherScreen;
