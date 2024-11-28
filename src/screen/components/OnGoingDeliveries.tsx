import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Alert, Image, RefreshControl, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../../config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

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
  products?: {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
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

  // Fetch deliveries function
  const fetchData = async () => {
    try {
      const storedId = await AsyncStorage.getItem('deliveryman_id');
      const storedToken = await AsyncStorage.getItem('deliveryman_token');

      if (storedId && storedToken) {
        setID(parseInt(storedId, 10));
        setToken(storedToken);

        const response = await axios.get(
          `${API_URL}/api/my-deliveries/on-deliveryman/${storedId}`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
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
      console.error('Error fetching ongoing deliveries:', error);
      Alert.alert(
        'Error',
        'Unable to fetch ongoing deliveries. Please try again later.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      setSelectedDelivery(delivery);
      setModalVisible(true);
    } else {
      Alert.alert('Error', 'Invalid delivery data.');
    }
  };

  const handleReport = () => {
    if (selectedDelivery) {
      setModalVisible(false);
      setSelectedDelivery(null);
      navigation.navigate('Report', { delivery: selectedDelivery });
    } else {
      Alert.alert('Error', 'No delivery selected.');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDelivery(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center mb-5">
        <TouchableOpacity className="p-2" onPress={() => navigation.openDrawer()}>
          <Image
            source={require('../../assets/dashboard/menu-svgrepo-com.png')}
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
            <View className="mb-4 p-5 bg-white rounded-lg shadow-md border border-blue-500">
              <View className="mb-2 w-full flex flex-row items-center px-1">
                <Text className="font-bold text-blue-600 text-xl">POID No:</Text>
                <Text className="text-black font-bold text-2xl">#{item.purchase_order_id || 'N/A'}</Text>
              </View>

              <View className="mb-2 w-full px-1">
                <Text className="font-bold text-blue-600 text-xl">Address:</Text>
                <Text className="text-black font-bold text-xl">
                  {item.address
                    ? `${item.address.street || 'N/A'}, ${item.address.barangay || 'N/A'}, ${item.address.city || 'N/A'}, ${item.address.province || 'N/A'}, ${item.address.zip_code || 'N/A'}`
                    : 'No Address Available'}
                </Text>
              </View>

              <View className="mb-2 w-full px-1">
                <Text className="font-bold text-blue-600 text-xl">Customer Name:</Text>
                <Text className="text-black font-bold text-xl">{item.customer_name || 'N/A'}</Text>
              </View>

              {/* View Button */}
              <TouchableOpacity
                className="mt-4 p-3 bg-blue-600 rounded-md items-center"
                onPress={() => openViewOrder(item)}
              >
                <Text className="text-white font-bold text-xl">View</Text>
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

      {/* Modal for Details */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <FlatList
          className="flex-1 p-5 bg-white"
          data={selectedDelivery ? selectedDelivery.products : []}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={
            <>
              <Text className="text-3xl font-bold mb-5">Order Details</Text>
              <View className="w-full mb-2 flex flex-row items-left items-center">
                <Text className="font-bold text-blue-600 text-xl mr-2">
                  Purchase Order ID #:
                </Text>
                <Text className="text-black font-bold text-2xl">
                  {selectedDelivery?.purchase_order_id || 'N/A'}
                </Text>
              </View>
              <View className="w-full mb-2 flex flex-row items-left items-center">
                <Text className="font-bold text-blue-600 text-xl mr-2">
                  Delivery ID #:
                </Text>
                <Text className="text-black font-bold text-2xl">
                  {selectedDelivery?.delivery_id || 'N/A'}
                </Text>
              </View>
              <View className="mb-2 flex flex-row items-center">
                <Text className="font-bold text-blue-600 text-xl mr-1">
                  Status:
                </Text>
                <Text className="text-green-600 font-bold text-2xl rounded-md">
                  {selectedDelivery?.status === 'OD' ? 'On Delivery' : selectedDelivery?.status || 'N/A'}
                </Text>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <View className="bg-gray-200 border-b border-gray-300 flex flex-row justify-between items-center px-2 py-2 mb-2 rounded-md shadow-md">
              <Text className="font-bold text-xl text-gray-900 flex-1 text-left">
                {item.product_name}
              </Text>
              <Text className="font-bold text-xl text-gray-700 flex-1 text-right">
                x{item.quantity}
              </Text>
            </View>
          )}
          ListFooterComponent={
            <>
              <TouchableOpacity
                className="mt-5 p-4 bg-blue-500 rounded-md items-center"
                onPress={handleReport}
              >
                <Text className='text-white font-bold text-xl'>
                  Report
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="mt-5 p-4 bg-red-600 rounded-md items-center"
                onPress={closeModal}
              >
                <Text className='text-white font-bold text-xl'>
                  Close
                </Text>
              </TouchableOpacity>
            </>
          }
        />
      </Modal>
    </SafeAreaView>
  );
};

export default OnGoingDeliveries;
