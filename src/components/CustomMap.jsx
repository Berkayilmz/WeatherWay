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

                // 📌 Rota çizgisi için koordinatları al
                const coordinates = route.geometry.coordinates.map(coord => ({
                    latitude: coord[1], // OSRM longitude-latitude formatında döner
                    longitude: coord[0]
                }));

                if (coordinates.length === 0) {
                    console.log("⚠️ Rota çizgisi oluşturulamadı. Koordinat verisi boş!");
                } else {
                    console.log("📍 Rota Koordinatları:", coordinates);
                }

                setRouteCoords(coordinates); // Rota çizgisini güncelle

                let totalDuration = 0; // Çıkış noktasından itibaren toplam süre
                let pointsMap = new Map();
                let startTime = new Date(); // Şu anki zamanı al (kalkış zamanı)

                route.legs.forEach((leg) => {
                    leg.steps.forEach((step) => {
                        const [lon, lat] = step.maneuver.location;
                        const name = step.name || step.ref || "İsimsiz Yol";

                        // 🕒 OSRM API'den gelen tahmini süre (saniye cinsinden)
                        const duration = step.duration || 0;
                        totalDuration += duration; // Süreyi kümülatif olarak artır

                        // 📅 Tahmini varış zamanını 24 saatlik formata çevir
                        // 📅 Tahmini varış zamanını tam formata çevir (YYYY-MM-DD HH:mm:ss)
                        const estimatedArrival = new Date(startTime.getTime() + totalDuration * 1000);

                        const yyyy = estimatedArrival.getFullYear();
                        const mm = String(estimatedArrival.getMonth() + 1).padStart(2, "0");
                        const dd = String(estimatedArrival.getDate()).padStart(2, "0");
                        const hh = String(estimatedArrival.getHours()).padStart(2, "0");
                        const min = String(estimatedArrival.getMinutes()).padStart(2, "0");
                        const ss = String(estimatedArrival.getSeconds()).padStart(2, "0");

                        const formattedArrivalTime = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;

                        console.log(`🔹 Yol: ${name} - Süre: ${Math.floor(duration / 60)} dk - Tahmini Varış: ${formattedArrivalTime}`);

                        if (!pointsMap.has(name)) {
                            pointsMap.set(name, {
                                name,
                                latitude: lat,
                                longitude: lon,
                                duration: totalDuration,
                                formattedArrivalTime
                            });
                        }
                    });
                });

                const uniquePoints = Array.from(pointsMap.values());
                setRouteData(uniquePoints);

                // 🔥 Harita görünümünü rota koordinatlarına göre güncelle
                if (mapRef.current) {
                    mapRef.current.fitToCoordinates(coordinates, {
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
