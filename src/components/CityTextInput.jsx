import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

const cities = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
    "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
    "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
    "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
    "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
    "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir",
    "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Sivas", "Şırnak",
    "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

const CityTextInput = ({ city, setCity, placeholder }) => {
    const [filteredCities, setFilteredCities] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleTextChange = (text) => {
        setCity(text);
        if (text.length > 0) {
            const filtered = cities.filter(c =>
                c.toLowerCase().startsWith(text.toLowerCase()) // 🔥 startsWith kullanıldı
            );
            console.log("Filtered Cities:", filtered); // DEBUG: Şehirleri kontrol et
            setFilteredCities(filtered);
            setShowDropdown(filtered.length > 0);
        } else {
            setShowDropdown(false);
        }
    };

    const handleSelectCity = (selectedCity) => {
        setCity(selectedCity);
        setShowDropdown(false);
    };

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#aaa"
                value={city}
                onChangeText={handleTextChange}
                keyboardType="default"
                autoCapitalize="sentences" // İlk harfi büyük yapması için
                autoCorrect={false}
            />
            {showDropdown && filteredCities.length > 0 && (
                <FlatList
                    data={filteredCities}
                    keyExtractor={(item, index) => index.toString()}
                    style={styles.dropdown}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectCity(item)}>
                            <Text style={styles.dropdownText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

export default CityTextInput;

const styles = StyleSheet.create({
    inputContainer: {
        width: "100%",
        padding: 10,
        backgroundColor: "#fff",
        position: "relative",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        width: "100%",
    },
    dropdown: {
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        maxHeight: 200, // 🔥 Uzun liste sorunu için
        zIndex: 1000,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    dropdownText: {
        color: "#000", // Siyah yazı
    }
});
