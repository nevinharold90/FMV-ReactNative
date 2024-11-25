import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../../config';
import { SafeAreaView } from 'react-native-safe-area-context';

export const OnGoingDeliveries = () => {
  const [id, setID] = useState('');
  const [token, setToken] = useState('');
  const [deliveries, setDeliveries] = useState([]); // State to store all deliveries
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [selectedDelivery, setSelectedDelivery] = useState(null); // State to store selected delivery

  useEffect(() => {
    const fetchUserData = async () => {
      const id = await AsyncStorage.getItem('deliveryman_id');
      const token = await AsyncStorage.getItem('deliveryman_token');
      if (id !== null) {
        const parsedID = parseInt(id, 10);
        setID(parsedID);
      }
      setToken(token);
    };

    const fetchOnGoingDelivery = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/my-deliveries/on-deliveryman/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          const deliveriesData = response.data;
          if (deliveriesData.length > 0) {
            setDeliveries(deliveriesData); // Store all deliveries in state
          }
        } else {
          console.log('Failed to fetch ongoing deliveries.');
        }
      } catch (error) {
        console.log('Error fetching ongoing deliveries:', error);
      }
    };

    fetchUserData();
    fetchOnGoingDelivery();
  }, [id, token]);

  const openViewOrder = (delivery) => {
    setSelectedDelivery(delivery); // Store the selected delivery
    setModalVisible(true); // Open the modal
  };

  const closeModal = () => {
    setModalVisible(false); // Close the modal
    setSelectedDelivery(null); // Clear the selected delivery
  };

  return (
    <SafeAreaView className="flex-1 px-5 bg-white">
      {/* Map through the deliveries array and display each delivery */}
      <ScrollView>
      {deliveries.length > 0 ? (
        deliveries.map((delivery, index) => (
          <View
            key={index}
            className="p-4 bg-white rounded-xl shadow-md mb-5"
          >
            <View className="flex-row items-center">
              <Text className="font-bold text-white bg-blue-700 rounded px-2 py-1">
                POID No:
              </Text>
              <Text className="ml-2 text-base">{delivery.purchase_order_id}</Text>
            </View>
            <View className="flex-row items-center mt-2">
              <Text className="font-bold text-white bg-blue-700 rounded px-2 py-1">
                Address:
              </Text>
              <Text className="ml-2 text-base">
                {delivery.address.street}, {delivery.address.barangay},{' '}
                {delivery.address.city}, {delivery.address.province},{' '}
                {delivery.address.zip_code}
              </Text>
            </View>
            <View className="flex-row items-center mt-2">
              <Text className="font-bold text-white bg-blue-700 rounded px-2 py-1">
                Status:
              </Text>
              <Text className="ml-2 text-base">{delivery.status}</Text>
            </View>
            <View className="flex-row items-center mt-2">
              <Text className="font-bold text-white bg-blue-700 rounded px-2 py-1">
                Customer Name:
              </Text>
              <Text className="ml-2 text-base">{delivery.customer_name}</Text>
            </View>
            <TouchableOpacity
              className="mt-4 bg-blue-600 rounded py-2 px-4 self-end"
              onPress={() => openViewOrder(delivery)} // Open modal on click
            >
              <Text className="text-white font-bold text-center">View</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text className="text-center mt-10">No ongoing deliveries found.</Text>
      )}
      </ScrollView>


      {/* Modal for viewing order details */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal} // Handle Android back button
      >
        <SafeAreaView className="flex-1 px-5 bg-white">
          <ScrollView>
            {selectedDelivery && (
              <>
                <Text className="text-xl font-bold mb-5">Order Details</Text>
                <Text className="text-base mb-3">
                  <Text className="font-bold">Purchase Order ID:</Text>{' '}
                  {selectedDelivery.purchase_order_id}
                </Text>
                <Text className="text-base mb-3">
                  <Text className="font-bold">Customer:</Text>{' '}
                  {selectedDelivery.customer_name}
                </Text>
                <Text className="text-base mb-3">
                  <Text className="font-bold">Address:</Text>{' '}
                  {selectedDelivery.address.street}, {selectedDelivery.address.barangay},{' '}
                  {selectedDelivery.address.city}, {selectedDelivery.address.province},{' '}
                  {selectedDelivery.address.zip_code}
                </Text>
                <Text className="text-base mb-3">
                  <Text className="font-bold">Status:</Text>{' '}
                  {selectedDelivery.status}
                </Text>
              </>
            )}
            <TouchableOpacity
              className="mt-5 bg-blue-600 rounded py-2 px-4 self-center"
              onPress={closeModal}
            >
              <Text className="text-white font-bold text-center">Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default OnGoingDeliveries;
