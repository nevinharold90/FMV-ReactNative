import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Image, View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../config';
import axios from 'axios';

import Report from './Report';
import OnGoingDeliveries from './components/OnGoingDeliveries';
import PastDeliveries from './components/PastDeliveries';

const Drawer = createDrawerNavigator();

// Main Home screen component
const HomeScreen = ({ navigation }: any) => {
  const [deliverymanName, setDeliverymanName] = useState<string>('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      const name = await AsyncStorage.getItem('deliveryman_name');
      if (name) setDeliverymanName(name);
    };
    fetchUserData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex flex-row items-center justify-between px-4 py-2 border-b-[0.5px]">
        <View className="flex flex-row items-center">
          <TouchableOpacity
            className="p-2"
            onPress={() => navigation.openDrawer()} // Opens the drawer navigation
          >
            <Image
              source={require('../assets/dashboard/menu-svgrepo-com.png')}
              className="w-10 h-10"
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-2 text-blue-500">
            Home
          </Text>
        </View>
        <Text className="text-2xl font-bold px-4 text-blue-500">
          {deliverymanName}
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Custom Drawer Content
const CustomDrawerContent = ({ navigation, deliverymanName }: any) => {
  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('deliveryman_token');
      const response = await axios.post(
        `${API_URL}/api/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        await AsyncStorage.clear();
        navigation.navigate('Login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <DrawerContentScrollView>
      <View className="flex-1 space-y-4 px-4 py-2">
        <DrawerItem
          label="Home"
          labelStyle={{ color: '#ffffff', fontSize: 20 }}
          onPress={() => navigation.navigate('Home')}
        />
        <DrawerItem
          label="My Deliveries"
          labelStyle={{ color: '#ffffff', fontSize: 20 }}
          onPress={() => navigation.navigate('My Deliveries')}
        />
        <DrawerItem
          label="Past Deliveries"
          labelStyle={{ color: '#ffffff', fontSize: 20 }}
          onPress={() => navigation.navigate('Past Deliveries')}
        />
        <DrawerItem
          label="" // Invisible item, no space or interaction
          style={{ height: 0 }}
          onPress={() => {}}
          enabled={false}
        />
        <DrawerItem
          label="Logout"
          labelStyle={{ color: '#ffffff', fontSize: 20 }}
          onPress={() => {
            Alert.alert(
              'Confirm Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', onPress: logout },
              ]
            );
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
};

// DrawerNavigator with Stack and Drawer integration
const DrawerNavigator = () => {
  const [deliverymanName, setDeliverymanName] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      const name = await AsyncStorage.getItem('deliveryman_name');
      if (name) setDeliverymanName(name);
    };
    fetchUserData();
  }, []);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#2954ba',
          width: Dimensions.get('window').width * 0.8,
        },
        drawerActiveTintColor: '#ffffff',
        drawerInactiveTintColor: '#d1d1d1',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* Main Drawer Screens */}
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="My Deliveries" component={OnGoingDeliveries} />
      <Drawer.Screen name="Past Deliveries" component={PastDeliveries} />
      
      {/* If Report is a separate screen, you can directly add it to the Drawer or elsewhere */}
      <Drawer.Screen name="Report" component={Report} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
