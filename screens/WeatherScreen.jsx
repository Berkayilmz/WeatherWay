import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";

const WeatherScreen = ({ route, navigation }) => {
    const { routeData } = route.params || {};

    console.log("📌 WeatherScreen İçin Gelen Veri:", routeData);

    if (!routeData || routeData.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>⚠️ Rota üzerindeki hava durumu verisi bulunamadı!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rota Üzerindeki Yollar</Text>
            <FlatList
                data={routeData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => {
                            console.log("⏩ Seçilen Yol:", item);
                            navigation.navigate("WeatherScreenDetail", {
                                roadName: item.name,
                                latitude: item.latitude,
                                longitude: item.longitude,
                            });
                        }}
                    >
                        <Text>📍 Yol: {item.name}</Text>
                        <Text>📍 Koordinatlar: {item.latitude}, {item.longitude}</Text>
                        <Text>🕒 Çıkış Noktasından İtibaren Süre: {Math.floor(item.duration / 60)} dk</Text>
                        <Text>⏰ Tahmini Varış Saati: {item.formattedArrivalTime}</Text>
                        <Text>⏩ Detayları Görmek İçin Tıklayın</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
    item: { padding: 15, backgroundColor: "#fff", borderRadius: 8, marginBottom: 10 },
});

export default WeatherScreen;
