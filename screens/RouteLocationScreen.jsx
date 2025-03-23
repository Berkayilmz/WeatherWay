import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import axios from "axios";

const RouteLocationScreen = ({ route }) => {
    const {
        roadName,
        latitude,
        longitude,
        startCityLatitude,
        startCityLongitude,
        endCityLatitude,
        endCityLongitude
    } = route.params;

    const [routeCoords, setRouteCoords] = useState([]);
    const mapRef = useRef(null);

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const OSRM_URL = `https://router.project-osrm.org/route/v1/driving/${startCityLongitude},${startCityLatitude};${longitude},${latitude};${endCityLongitude},${endCityLatitude}?overview=full&geometries=geojson`;

                const response = await axios.get(OSRM_URL);
                if (response.data.routes && response.data.routes.length > 0) {
                    const route = response.data.routes[0];
                    const coordinates = route.geometry.coordinates.map(coord => ({
                        latitude: coord[1],
                        longitude: coord[0]
                    }));
                    setRouteCoords(coordinates);

                    // ✅ Haritayı rota koordinatlarına göre yakınlaştır
                    if (mapRef.current) {
                        mapRef.current.fitToCoordinates(coordinates, {
                            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                            animated: true,
                        });
                    }
                } else {
                    console.error("❌ OSRM API geçerli bir rota döndürmedi!");
                }
            } catch (error) {
                console.error("🚨 Rota alınırken hata oluştu:", error);
            }
        };

        fetchRoute();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📍 {roadName}</Text>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: startCityLatitude,
                    longitude: startCityLongitude,
                    latitudeDelta: 2,
                    longitudeDelta: 2,
                }}
            >
                {/* Başlangıç noktası (Gri) */}
                <Marker
                    coordinate={{ latitude: startCityLatitude, longitude: startCityLongitude }}
                    title="Başlangıç Noktası"
                    pinColor="gray"
                />

                {/* Ana yol noktası (Kırmızı) */}
                <Marker
                    coordinate={{ latitude, longitude }}
                    title="Mevcut Konum"
                    pinColor="red"
                />

                {/* Bitiş noktası (Gri) */}
                <Marker
                    coordinate={{ latitude: endCityLatitude, longitude: endCityLongitude }}
                    title="Varış Noktası"
                    pinColor="gray"
                />

                {/* Gerçek Yol Üzerinden Rota Çizgisi */}
                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor="blue"
                        strokeWidth={4}
                    />
                )}
            </MapView>
        </View>
    );
};

export default RouteLocationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 10,
    },
    map: {
        flex: 1,
    },
});