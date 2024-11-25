import React, { useEffect, useState } from 'react';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnGoingDeliveries from './components/OnGoingDeliveries';
import PastDeliveries from './components/PastDeliveries';
import { API_URL } from '../../config';
import axios from 'axios';
import { ScrollView } from 'react-native-gesture-handler';

const Drawer = createDrawerNavigator();

const DashboardScreen = ({ navigation }: any) => {
  const [deliverymanName, setDeliverymanName] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      const name = await AsyncStorage.getItem('deliveryman_name');
      if (name) setDeliverymanName(name);
    };
    fetchUserData();
  }, []);

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('deliveryman_token');
      const response = await axios.post(
        `${API_URL}/api/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await AsyncStorage.clear(); // Clear all stored data
        navigation.navigate('Login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-left items-center px-2 h-[5%]">
        {/* Hamburger Menu Button */}
        <TouchableOpacity 
          className="p-2"
          onPress={() => navigation.openDrawer()} // Opens the drawer navigation
        >
          <Image
            source={require('../assets/dashboard/menu-svgrepo-com.png')} // Replace with your hamburger icon path
            className="w-10 h-10"
          />
        </TouchableOpacity>
  
        {/* Dashboard Title */}
        <View className='flex flex-row justify-left'>
          <Text className="text-2xl font-bold w-1/2">
            Dashboard
          </Text>
          <View className='flex flex-row justify-end bg-red-500  '>
            <TouchableOpacity 
              className='justify-center w-1/2'
              onPress={logout}
            >
              <Text className='align-middle'>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className='flex-1 '>
        <View className='w-full p-2 flex flex-row justify-evenly'>
          <TouchableOpacity className=' bg-blue-500 w-[45%] h-full rounded-2xl p-2'>
            <Text className='text-white'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui consectetur odit nobis corporis saepe maiores fugit quia pariatur in molestias? Alias, delectus quam sequi architecto minima ex rem unde modi.
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className=' bg-blue-500 w-[45%] h-full rounded-2xl p-2'>
            <Text className='text-white'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui consectetur odit nobis corporis saepe maiores fugit quia pariatur in molestias? Alias, delectus quam sequi architecto minima ex rem unde modi.
            </Text>
          </TouchableOpacity>
        </View>
        <View className='w-full p-2 flex flex-row justify-evenly'>
        <TouchableOpacity className=' bg-blue-500 w-[45%] h-full rounded-2xl p-2'>
            <Text className='text-white'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui consectetur odit nobis corporis saepe maiores fugit quia pariatur in molestias? Alias, delectus quam sequi architecto minima ex rem unde modi.
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className=' bg-blue-500 w-[45%] h-full rounded-2xl p-2'>
            <Text className='text-white'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui consectetur odit nobis corporis saepe maiores fugit quia pariatur in molestias? Alias, delectus quam sequi architecto minima ex rem unde modi.
            </Text>
          </TouchableOpacity>
        </View>
        <View className='w-full p-2 flex flex-row justify-evenly'>
          <TouchableOpacity className=' bg-blue-500 w-[45%] h-full rounded-2xl p-2'>
            <Text className='text-white'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui consectetur odit nobis corporis saepe maiores fugit quia pariatur in molestias? Alias, delectus quam sequi architecto minima ex rem unde modi.
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className=' bg-blue-500 w-[45%] h-full rounded-2xl p-2'>
            <Text className='text-white'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui consectetur odit nobis corporis saepe maiores fugit quia pariatur in molestias? Alias, delectus quam sequi architecto minima ex rem unde modi.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
  
};

const Dashboard = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false, // Hides the header
        drawerStyle: {
          width: Dimensions.get('window').width * 0.8,
        },
      }}
    >
      {/* Changed name to be more descriptive */}
      <Drawer.Screen name="Dashboard Home" component={DashboardScreen} />
      <Drawer.Screen name="On-Going Deliveries" component={OnGoingDeliveries} />
      <Drawer.Screen name="Past Deliveries" component={PastDeliveries} />
    </Drawer.Navigator>
  );
};

export default Dashboard;
