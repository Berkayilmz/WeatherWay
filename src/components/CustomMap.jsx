import React, { useEffect, useState, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import axios from "axios";

const CustomMap = ({ startCoords, endCoords, setRouteData }) => {
    const [routeCoords, setRouteCoords] = useState([]);
    const mapRef = useRef(null); // 🔥 MapView'e erişmek için referans

    useEffect(() => {
        if (!startCoords || !endCoords) {
            console.log("⏳ Koordinatlar bekleniyor...");
            return;
        }

        const fetchRoute = async () => {
            try {
                console.log("🚀 Rota isteği yapılıyor...");
                const OSRM_URL = `https://router.project-osrm.org/route/v1/driving/${startCoords.longitude},${startCoords.latitude};${endCoords.longitude},${endCoords.latitude}?overview=full&geometries=geojson&steps=true`;
                
                const response = await axios.get(OSRM_URL);
                if (!response.data.routes || response.data.routes.length === 0) {
                    console.log("❌ OSRM API'den geçerli bir rota verisi alınamadı!");
                    return;
                }

                console.log("✅ Rota başarıyla alındı!");

                const route = response.data.routes[0];
                const coordinates = route.geometry.coordinates;
                const mappedCoords = coordinates.map((coord) => ({
                    latitude: coord[1],
                    longitude: coord[0],
                }));

                setRouteCoords(mappedCoords);

                let pointsMap = new Map();
                route.legs.forEach((leg) => {
                    leg.steps.forEach((step) => {
                        const [lon, lat] = step.maneuver.location;
                        const name = step.name || "İsimsiz Yol";

                        if (!pointsMap.has(name)) {
                            pointsMap.set(name, { name, latitude: lat, longitude: lon });
                        }
                    });
                });

                const uniquePoints = Array.from(pointsMap.values());
                setRouteData(uniquePoints);

                // 🔥 Harita görünümünü rota koordinatlarına göre güncelle
                if (mapRef.current) {
                    mapRef.current.fitToCoordinates(mappedCoords, {
                        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, // Harita kenar boşlukları
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
            ref={mapRef} // 🔥 MapView referansını tanımlıyoruz
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
                latitude: startCoords ? startCoords.latitude : 39.9208,
                longitude: startCoords ? startCoords.longitude : 32.8541,
                latitudeDelta: 5,
                longitudeDelta: 5,
            }}
        >
            {startCoords && <Marker coordinate={startCoords} title="Başlangıç Noktası" />}
            {endCoords && <Marker coordinate={endCoords} title="Varış Noktası" />}
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
