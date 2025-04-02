import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import citiesData from '../../assets/cities/cities.json'; // JSON dosyan buradaysa

const CityTextInput = ({ city, setCity, placeholder }) => {
    const [cityDistrictArray, setCityDistrictArray] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const allCityDistrictPairs = [];
    
        citiesData.data.forEach(il => {
            const ilceAdlari = il.ilceler.map(ilce => ilce.ilce_adi.toLowerCase());
    
            const hasMerkez = ilceAdlari.includes("merkez");
            if (!hasMerkez) {
                allCityDistrictPairs.push(il.il_adi);
            }
    
            il.ilceler.forEach(ilce => {
                allCityDistrictPairs.push(`${il.il_adi}, ${ilce.ilce_adi}`);
            });
        });
    
        setCityDistrictArray(allCityDistrictPairs);
    }, []);

    const handleTextChange = (text) => {
        setCity(text);
        if (text.length > 0) {
            const filtered = cityDistrictArray.filter(entry =>
                entry.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredList(filtered);
            setShowDropdown(filtered.length > 0);
        } else {
            setShowDropdown(false);
        }
    };

    const handleSelect = (selected) => {
        setCity(selected);
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
                autoCapitalize="sentences"
                autoCorrect={false}
            />
            {showDropdown && filteredList.length > 0 && (
                <FlatList
                    data={filteredList}
                    keyExtractor={(item, index) => index.toString()}
                    style={styles.dropdown}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelect(item)}>
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
        maxHeight: 200,
        zIndex: 1000,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    dropdownText: {
        color: "#000",
    }
});