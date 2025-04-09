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

  useEffect(() => {
    const fetchRouteData = async () => {
      if (!startCoords || !endCoords) {
        setRouteCoords([]);
        setRouteData([]);
        return;
      }

      try {
        const coords = await getPolylineCoords(startCoords, endCoords);
        setRouteCoords(coords);

        const segments = await getRouteSegments(coords, travelDate, departureTime);
        setRouteData(segments);

        onRouteReady?.();
      } catch (error) {
        console.error("🚨 Rota verileri alınırken hata:", error);
      }
    };

    fetchRouteData();
  }, [startCoords, endCoords, travelDate, departureTime]);

  useEffect(() => {
    if (mapRef.current && routeCoords.length > 0) {
      mapRef.current.fitToCoordinates(routeCoords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [routeCoords]);

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
