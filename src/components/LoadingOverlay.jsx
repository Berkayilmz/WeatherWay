import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

const LoadingOverlay = ({ visible, message = "Yükleniyor..." }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  box: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});

export default LoadingOverlay;