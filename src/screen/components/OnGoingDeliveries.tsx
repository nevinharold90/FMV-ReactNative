import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Alert, Image, RefreshControl, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../../config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import OrderDetails from './OnGoingModal/OrderDetails'; 
import RefundDetails from './OnGoingModal/RefundDetails';  

type Delivery = {
  delivery_id: number;
  purchase_order_id: string;
  address?: {
    street?: string;
    barangay?: string;
    city?: string;
    province?: string;
    zip_code?: string;
  };
  status?: string;
  customer_name?: string;
  has_damages?: boolean;
  products?: {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    no_of_damages?: number;
  }[];
};

interface OnGoingDeliveriesProps {
  navigation: NavigationProp<any>;
}

const OnGoingDeliveries: React.FC<OnGoingDeliveriesProps> = ({ navigation }) => {
  const [id, setID] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [viewType, setViewType] = useState<'OrderDetails' | 'RefundDetails'>('OrderDetails'); // Added viewType
  const [selectedStatus, setSelectedStatus] = useState<string>('OD'); // Default status 'OD'


  const handleNetworkError = (error) => {
    if (error.message === 'Network Error') {
      Alert.alert(
        'Network Error',
        'It seems there is a problem with your internet connection. Please check and try again.'
      );
    } else {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'Unexpected error occurred.');
    }
  };

  
  // Fetch deliveries function
  const fetchData = async () => {
    try {
      const storedId = await AsyncStorage.getItem('deliveryman_id');
      const storedToken = await AsyncStorage.getItem('deliveryman_token');
  
      if (storedId && storedToken) {
        setID(parseInt(storedId, 10));
        setToken(storedToken);
  
        // Modify the API request to include the selected status filter
        const response = await axios.get(
          `${API_URL}/api/my-deliveries/on-deliveryman/${storedId}`, 
          {
            params: { status: selectedStatus }, // Add the status filter to the query string
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
            timeout: 5000, // 5 seconds timeout
          }
        );
  
        if (response.status === 200) {
          const validDeliveries = response.data.filter(
            (item: Delivery) => item.delivery_id
          );
          setDeliveries(validDeliveries);
        } else {
          Alert.alert('Error', 'Failed to fetch ongoing deliveries.');
        }
      }
    } catch (error) {
      console.error('Error fetching ongoing deliveries:', error.message);
      console.error('Error details:', error.response?.data || error);
      Alert.alert('Error', 'Unable to fetch ongoing deliveries. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const storedId = await AsyncStorage.getItem('deliveryman_id');
      const storedToken = await AsyncStorage.getItem('deliveryman_token');
  
      if (storedId && storedToken) {
        setID(parseInt(storedId, 10));
        setToken(storedToken);
        fetchData(); // Call fetchData after both id and token are set
      } else {
        Alert.alert('Error', 'Failed to retrieve stored credentials.');
      }
      setLoading(false);
    };
  
    initializeData();
  }, []);

  
  

  // Refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(); // Re-fetch the deliveries whenever the screen is focused
    }, [])
  );

  const openViewOrder = (delivery: Delivery) => {
    if (delivery && delivery.delivery_id) {
      setSelectedDelivery(delivery);  // Set the selected delivery
  
      // Check if the delivery has damages and set the view accordingly
      if (delivery.has_damages) {
        setViewType('RefundDetails');
      } else {
        setViewType('OrderDetails');
      }
  
      setModalVisible(true);  // Show the modal
    } else {
      Alert.alert('Error', 'Invalid delivery data.');  // Show an error if no valid delivery
    }
  };

  const closeModal = () => {
    setModalVisible(false);        // Hide the modal
    setSelectedDelivery(null);     // Reset the selected delivery data
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center mb-5">
        <TouchableOpacity className="p-2" onPress={() => navigation.openDrawer()}>
          <Image
            source={require('../../assets/dashboard/modal/menu-svgrepo-com.png')}
            className="w-10 h-10"
          />
        </TouchableOpacity>
        <Text className="text-2xl font-bold ml-3">
          Assigned Delivery
        </Text>
      </View>

      {/* Deliveries List */}
      {deliveries.length > 0 ? (
        <FlatList
          className='p-5'
          data={deliveries}
          keyExtractor={(item) =>
            item.delivery_id ? item.delivery_id.toString() : `${Math.random()}`
          }
          renderItem={({ item }) => (
            <View className={`mb-4 p-5 bg-white rounded-lg shadow-md border ${item.has_damages ? 'border-red-500' : 'border-blue-500'} `}>
              <View className="mb-2 w-full flex flex-row items-center px-1">
                <Text className={`font-bold text-xl ${item.has_damages ? 'text-red-500' : ' text-blue-600 '}`}>POID No:</Text>
                <Text className="text-black font-bold text-2xl">#{item.purchase_order_id || 'N/A'}</Text>
              </View>

              <View className="mb-2 w-full px-1">
                <Text className={`font-bold text-xl ${item.has_damages ? 'text-red-500' : ' text-blue-600 '}`}>Address:</Text>
                <Text className="text-black font-bold text-xl">
                  {item.address
                    ? `${item.address.street || 'N/A'}, ${item.address.barangay || 'N/A'}, ${item.address.city || 'N/A'}, ${item.address.province || 'N/A'}, ${item.address.zip_code || 'N/A'}`
                    : 'No Address Available'}
                </Text>
              </View>

              <View className="mb-2 w-full px-1">
                <Text className={`font-bold text-xl ${item.has_damages ? 'text-red-500' : ' text-blue-600 '}`}>Customer Name:</Text>
                <Text className="text-black font-bold text-xl">{item.customer_name || 'N/A'}</Text>
              </View>

              {/* View Button */}
              <TouchableOpacity
                className={`mt-4 p-3 rounded-md items-center ${item.has_damages ? 'bg-red-500' : 'bg-blue-600'}`}
                onPress={() => openViewOrder(item)}
              >
                <Text className="text-white font-bold text-xl">
                  {item.has_damages ? 'View Refund Delivery' : 'View Delivery'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <Text className="text-center text-black">No ongoing deliveries found.</Text>
        </ScrollView>
      )}

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal} // Properly close modal on Android back button
      >
        {/* Check if selectedDelivery exists before rendering the modal content */}
        {selectedDelivery ? (
          viewType === 'OrderDetails' ? (
            <OrderDetails delivery={selectedDelivery} onClose={closeModal} />
          ) : (
            <RefundDetails delivery={selectedDelivery} onClose={closeModal} />
          )
        ) : (
          // Fallback UI if selectedDelivery is not available
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>No delivery data available</Text>
          </View>
        )}
      </Modal>

    </SafeAreaView>
  );
};

export default OnGoingDeliveries;
