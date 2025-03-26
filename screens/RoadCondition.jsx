import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';

const RoadCondition = () => {
  const [kapaliYollar, setKapaliYollar] = useState([]);
  const [loading, setLoading] = useState(true);

  const getKapaliYollar = async () => {
    const url = 'https://yol.kgm.gov.tr/arcgis/rest/services/Yol/YolDurumu/MapServer/0/query';

    const params = {
      where: '1=1', // tüm yollar
      outFields: '*',
      f: 'json',
    };

    try {
      const response = await axios.get(url, { params });
      const roads = response.data.features;

      if (!roads || roads.length === 0) {
        setKapaliYollar([]);
        return;
      }

      const kapali = roads.filter(r => r.attributes.durumu === 2); // 2 = KAPALI
      setKapaliYollar(kapali);
    } catch (error) {
      console.error('❌ API Hatası:', error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    getKapaliYollar();
  }, []);

  const renderItem = ({ item, index }) => {
    const info = item.attributes;

    return (
      <View style={styles.item}>
        <Text style={styles.title}>#{index + 1} - {info.iladi}</Text>
        <Text>🛣️ Yol: {info.yolunadi}</Text>
        <Text>❌ Neden: {info.nedeni || info.kisatanim || 'Bilinmiyor'}</Text>
        <Text>📆 Tarih: {info.tarih || 'Belirsiz'}</Text>
        <Text>🕒 Açılış Planı: {info.planned_opening_time || 'Belli değil'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚧 Kapalı Yol Bilgileri</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : kapaliYollar.length === 0 ? (
        <Text style={styles.noData}>✅ Şu anda kapalı yol görünmüyor.</Text>
      ) : (
        <FlatList
          data={kapaliYollar}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default RoadCondition;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
  },
});