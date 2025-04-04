import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const DateTimeSelector = ({
  travelDate,
  departureTime,
  onShowDatePicker,
  onShowTimePicker,
}) => {
  return (
    <View style={styles.datetimeRow}>
      <View style={styles.datetimeCard}>
        <Text style={styles.datetimeLabel}>🗓️ Çıkış Tarihi</Text>
        <Button
          title={travelDate.toLocaleDateString("tr-TR")}
          onPress={onShowDatePicker}
          color="#007BFF"
        />
      </View>
      <View style={styles.datetimeCard}>
        <Text style={styles.datetimeLabel}>🕒 Çıkış Saati</Text>
        <Button
          title={departureTime || "Saat Seç"}
          onPress={onShowTimePicker}
          color="#007BFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  datetimeRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    gap: 10,
  },
  datetimeCard: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  datetimeLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
    fontWeight: "600",
  },
});

export default DateTimeSelector;