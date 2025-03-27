import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './screens/HomeScreen';
import WeatherScreen from './screens/WeatherScreen';
import WeatherScreenDetail from './screens/WeatherScreenDetail';
import CityWeatherDetailScreen from './screens/CityWeatherDetailScreen';
import RouteLocationScreen from './screens/RouteLocationScreen';
import RoadCondition from './screens/RoadCondition';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="WeatherScreen" component={WeatherScreen} options={{ title: "Hava Durumu" }} />
          <Stack.Screen name="WeatherScreenDetail" component={WeatherScreenDetail} options={{ title: "Hava Durumu Detayları" }} />
          <Stack.Screen name="CityWeatherDetailScreen" component={CityWeatherDetailScreen} options={{ title: "Hava Durumu Detayları" }} />
          <Stack.Screen name="RouteLocationScreen" component={RouteLocationScreen} options={{ title: "Güzergah Bilgisi" }}/>
          <Stack.Screen name="RoadCondition" component={RoadCondition} options={{title:"Yol Durumu Bilgileri"}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
