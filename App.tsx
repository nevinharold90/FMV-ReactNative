import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import Login from './src/screen/Login';
import Home from './src/screen/Home';
import OnGoingDeliveries from './src/screen/components/OnGoingDeliveries';
import Report from './src/screen/Report';
import './global.css'; // Tailwind global styles for NativeWind

import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null); // Initial route is now null to determine dynamically

  // Load fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        const deliverymanId = await AsyncStorage.getItem('deliveryman_id');

        if (isLoggedIn === 'true' && deliverymanId) {
          // If user is already logged in, set initial route to Home
          setInitialRoute('HomeScreen');
        } else {
          // Otherwise, set initial route to Login
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setInitialRoute('Login');
      }
    };

    checkLoginStatus();
  }, []);

  // Display a loading spinner until fonts and initial route are loaded
  if (!fontsLoaded || initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="HomeScreen" component={Home} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
