import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";

import useInitialRegion from "../../hooks/useInitialRegion";
import { getPolylineCoords, getRouteSegments } from "../../utils/routeUtils";

const CustomMap = ({
  startCoords,
  endCoords,
  setRouteData,
  departureTime,
  travelDate,
  onRouteReady,
}) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const initialRegion = useInitialRegion();
  const mapRef = useRef(null);

  // 🚗 Rota verilerini çek (polyline + segment)
  useEffect(() => {
    if (!startCoords || !endCoords) {
      setRouteCoords([]);
      setRouteData([]);
      return;
    }

    const fetchRouteData = async () => {
      try {
        const coords = await getPolylineCoords(startCoords, endCoords);
        setRouteCoords(coords);            // polyline çizimi için
        onRouteReady?.();                  // loading'i kapat

        const segments = await getRouteSegments(coords, travelDate, departureTime);
        setRouteData(segments);           // weather screen için
      } catch (error) {
        console.error("🚨 Rota verileri alınırken hata:", error);
      }
    };

    fetchRouteData();
  }, [startCoords, endCoords, travelDate, departureTime]);

  useEffect(() => {
    if (mapRef.current && routeCoords.length > 0) {
      const timeout = setTimeout(() => {
        mapRef.current.fitToCoordinates(routeCoords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [routeCoords]);

  // 📍 Harita yüklenmeden önce loading göstergesi
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
        onLayout={() => {
          if (routeCoords.length > 0) {
            mapRef.current?.fitToCoordinates(routeCoords, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CustomMap;