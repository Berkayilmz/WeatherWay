import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'

const CityTextInput = ({ city, setCity, placeholder }) => {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={city}
                onChangeText={setCity}
                keyboardType="default" // 🔥 Klavye türünü normal metin olarak ayarlıyoruz
                autoCapitalize="none" // 🔥 Büyük harf otomatik yapılmasını engelliyoruz
                autoCorrect={false} // 🔥 Otomatik düzeltmeyi kapatıyoruz
                textContentType="none" // 🔥 Özel bir giriş modu kullanılmadığından emin oluyoruz
            />
        </View>
    )
}

export default CityTextInput

const styles = StyleSheet.create({
    inputContainer: {
        width: "100%",
        padding: 10,
        backgroundColor: "#fff",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        width: "100%",
    },
});
