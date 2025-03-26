import React, { useEffect, useState, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import axios from "axios";

const CustomMap = ({ startCoords, endCoords, setRouteData }) => {
    const [routeCoords, setRouteCoords] = useState([]);
    const mapRef = useRef(null);

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
                const startTime = new Date();

                route.legs.forEach((leg) => {
                    leg.steps.forEach((step) => {
                        const [lon, lat] = step.maneuver.location;
                        const name = step.name;

                        // 🔥 1 dakikadan kısa veya isimsiz yolları atla
                        if (!name || name === "İsimsiz Yol" || step.duration < 60) return;

                        totalDuration += step.duration;
                        const estimatedArrival = new Date(startTime.getTime() + totalDuration * 1000);

                        // Türkiye saatine +3 saat ekleyelim:
                        const estimatedArrivalTR = new Date(estimatedArrival.getTime() + 3 * 60 * 60 * 1000);

                        const formattedArrivalTime = estimatedArrivalTR.toISOString().replace("T", " ").substring(0, 19);

                        if (!pointsMap.has(name)) {
                            pointsMap.set(name, {
                                name,
                                latitude: lat,
                                longitude: lon,
                                duration: totalDuration,
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

    return (
        <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
                latitude: startCoords ? startCoords.latitude : 39.9208,
                longitude: startCoords ? startCoords.longitude : 32.8541,
                latitudeDelta: 5,
                longitudeDelta: 5,
            }}
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
    );
};

const styles = StyleSheet.create({
    map: {
        width: "100%",
        height: "100%",
    },
});

export default CustomMap;