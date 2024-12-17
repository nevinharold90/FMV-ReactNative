import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Alert, Image, RefreshControl, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../url';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
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
    id?: number;
    product_id?: number;
    product_name?: string;
    name?: string; // Just in case the API returns 'name' instead of 'product_name'
    quantity: number;
    price?: number;
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
  const [viewType, setViewType] = useState<'OrderDetails' | 'RefundDetails'>('OrderDetails');
  const [selectedStatus, setSelectedStatus] = useState<string>('OD');

  const handleNetworkError = (error: any) => {
    if (error.message === 'Network Error') {
      Alert.alert('Network Error', 'Please check your internet connection.');
    } else {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'Unexpected error occurred.');
    }
  };

  const fetchData = async () => {
    try {
      const storedId = await AsyncStorage.getItem('deliveryman_id');
      const storedToken = await AsyncStorage.getItem('deliveryman_token');
  
      if (storedId && storedToken) {
        console.log(`${API_URL}/api/my-deliveries/on-deliveryman/${storedId}?status=${selectedStatus}`);
  
        const response = await axios.get(
          `${API_URL}/api/my-deliveries/on-deliveryman/${storedId}`,
          {
            params: { status: selectedStatus },
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );
  
        // Check if response.data is an object with numeric keys
        if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Convert the object to an array of values
          const deliveriesArray = Object.values(response.data);
  
          // Filter valid deliveries (those with a delivery_id)
          const validDeliveries = deliveriesArray.filter((item: Delivery) => item.delivery_id);
          
          if (validDeliveries.length > 0) {
            setDeliveries(validDeliveries); // Populate deliveries if data is found
          } else {
            setDeliveries([]); // Empty the deliveries if none found
            Alert.alert('No deliveries found for this status');
          }
        } else {
          // If the response is not an object, handle it as an error or empty state
          setDeliveries([]); // Clear deliveries if unexpected data format
          Alert.alert('Unexpected data format received');
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setDeliveries([]); // Ensure deliveries are cleared on 404 error
        console.log('No deliveries found for the given status');
      } else {
        console.error('Unexpected error:', error);
        handleNetworkError(error);
      }
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
        fetchData();
      } else {
        Alert.alert('Error', 'Failed to retrieve stored credentials.');
      }
      setLoading(false);
    };

    initializeData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const openViewOrder = async (delivery: Delivery) => {
    if (!delivery || !delivery.delivery_id) {
      Alert.alert('Error', 'Invalid delivery data.');
      return;
    }

    try {
      if (!token) {
        Alert.alert('Error', 'Missing token. Please re-login.');
        return;
      }

      const productResponse = await axios.get(`${API_URL}/api/deliveries/${delivery.delivery_id}/product-lists`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      if (productResponse.status === 200 && Array.isArray(productResponse.data.products)) {
        const updatedDelivery = {
          ...delivery,
          products: productResponse.data.products,
        };

        setSelectedDelivery(updatedDelivery);
        setViewType(updatedDelivery.has_damages ? 'RefundDetails' : 'OrderDetails');
        setModalVisible(true);
      } else {
        Alert.alert('Error', 'Failed to fetch product details for this delivery.');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Something went wrong while fetching product details.');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDelivery(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center mb-5">
        <TouchableOpacity className="p-2" onPress={() => navigation.openDrawer()}>
          <Image
            source={require('../../assets/dashboard/modal/menu-svgrepo-com.png')}
            className="w-10 h-10"
          />
        </TouchableOpacity>
        <Text className="text-2xl font-bold ml-3">Assigned Delivery</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text>Loading...</Text>
        </View>
      ) : deliveries.length > 0 ? (
        <FlatList
          className="p-5"
          data={deliveries}
          keyExtractor={(item) => item.delivery_id.toString()}
          renderItem={({ item }) => (
            <View className={`mb-4 p-5 bg-white rounded-lg shadow-md border ${item.has_damages ? 'border-red-500' : 'border-blue-500'}`}>
              <View className="mb-2 w-full flex flex-row px-1">
                <Text className={`font-bold text-xl ${item.has_damages ? 'text-red-500' : 'text-blue-600'}`}>POID No:</Text>
                <Text className="text-black font-bold text-2xl">#{item.purchase_order_id || 'N/A'}</Text>
              </View>
              <View className="mb-2 w-full flex flex-row px-1">
                <Text className={`font-bold text-xl ${item.has_damages ? 'text-red-500' : 'text-blue-600'}`}>Delivery No:</Text>
                <Text className="text-black font-bold text-2xl">#{item.delivery_id || 'N/A'}</Text>
              </View>
              <View className="mb-2 w-full px-1">
                <Text className={`font-bold text-xl ${item.has_damages ? 'text-red-500' : 'text-blue-600'}`}>Address:</Text>
                <Text className="text-black font-bold text-xl">
                  {item.address
                    ? `${item.address.street || 'N/A'}, ${item.address.barangay || 'N/A'}, ${item.address.city || 'N/A'}, ${item.address.province || 'N/A'}, ${item.address.zip_code || 'N/A'}` 
                    : 'No Address Available'}
                </Text>
              </View>
              <View className="mb-2 w-full px-1">
                <Text className={`font-bold text-xl ${item.has_damages ? 'text-red-500' : 'text-blue-600'}`}>Customer Name:</Text>
                <Text className="text-black font-bold text-xl">{item.customer_name || 'N/A'}</Text>
              </View>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <Text className="text-center text-black">No ongoing deliveries found.</Text>
        </ScrollView>
      )}

      <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={closeModal}>
        {selectedDelivery ? (
          viewType === 'OrderDetails' ? (
            <OrderDetails delivery={selectedDelivery} onClose={closeModal} />
          ) : (
            <RefundDetails delivery={selectedDelivery} onClose={closeModal} />
          )
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>No delivery data available</Text>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default OnGoingDeliveries;
