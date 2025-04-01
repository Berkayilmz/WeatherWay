import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const CustomMap = ({ startCoords, endCoords, setRouteData, departureTime }) => {
    const [routeCoords, setRouteCoords] = useState([]);
    const [initialRegion, setInitialRegion] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn("Konum izni reddedildi.");
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
                timeout: 5000
            });

            setInitialRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        })();
    }, []);

    useEffect(() => {
        if (!startCoords || !endCoords) return;

        const fetchRoute = async () => {
            try {
                const OSRM_URL = `https://router.project-osrm.org/route/v1/driving/${startCoords.longitude},${startCoords.latitude};${endCoords.longitude},${endCoords.latitude}?overview=full&geometries=geojson&steps=true`;
                const response = await axios.get(OSRM_URL);
                const route = response.data.routes[0];
                if (!route) return;

                const coordinates = route.geometry.coordinates.map(coord => ({
                    latitude: coord[1],
                    longitude: coord[0],
                }));
                setRouteCoords(coordinates);

                let totalDuration = 0;
                let pointsMap = new Map();
                let startTime = new Date();

                if (departureTime) {
                    const [hour, minute] = departureTime.split(":").map(Number);
                    startTime.setHours(hour);
                    startTime.setMinutes(minute);
                    startTime.setSeconds(0);

                    if (startTime < new Date()) {
                        startTime.setDate(startTime.getDate() + 1);
                    }
                }

                route.legs.forEach((leg) => {
                    leg.steps.forEach((step) => {
                        const [lon, lat] = step.maneuver.location;
                        const name = step.name;
                        if (!name || name === "İsimsiz Yol" || step.duration < 60) return;

                        totalDuration += step.duration;
                        const estimatedArrival = new Date(startTime.getTime() + totalDuration * 1000);
                        const estimatedArrivalTR = new Date(estimatedArrival.getTime() + 3 * 60 * 60 * 1000);
                        const formattedArrivalTime = estimatedArrivalTR.toISOString().replace("T", " ").substring(0, 19);

                        if (!pointsMap.has(name)) {
                            pointsMap.set(name, {
                                name,
                                latitude: lat,
                                longitude: lon,
                                duration: totalDuration / 60, // dakika
                                formattedArrivalTime,
                            });
                        }
                    });
                });

                const uniquePoints = Array.from(pointsMap.values());
                setRouteData(uniquePoints);

                if (mapRef.current && coordinates.length > 0) {
                    mapRef.current.fitToCoordinates(coordinates, {
                        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                        animated: true,
                    });
                }
            } catch (error) {
                console.error("🚨 Rota bilgisi getirilirken hata oluştu: ", error);
            }
        };

        fetchRoute();
    }, [startCoords, endCoords]);

    if (!initialRegion) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
            >
                {startCoords && (
                    <Marker coordinate={startCoords} title="Başlangıç Noktası" pinColor="blue" />
                )}
                {endCoords && (
                    <Marker coordinate={endCoords} title="Varış Noktası" pinColor="blue" />
                )}
                {routeCoords.length > 0 && (
                    <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
                )}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    map: {
        width: "100%",
        height: "100%",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default CustomMap;