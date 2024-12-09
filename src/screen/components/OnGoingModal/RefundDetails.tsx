import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_URL } from '../../../url'; // Update to match your configuration

type Product = {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  no_of_damages?: number;
};

type Delivery = {
  purchase_order_id: string;
  delivery_id: number;
  status: string;
  products: Product[];
};

interface RefundDetailsProps {
  delivery: Delivery;
  onClose: () => void;
}

const RefundDetails: React.FC<RefundDetailsProps> = ({ delivery, onClose }) => {
  // State for the reason dropdown
  const [selectedReason, setSelectedReason] = useState<string>('Damaged Product'); // Default reason
  const [loading, setLoading] = useState(false);

  // Filter products that have damages
  const damagedProducts = delivery.products.filter(
    (product) => product.no_of_damages && product.no_of_damages > 0
  );

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Please select a reason');
      return;
    }

    setLoading(true);
    try {
      // Send the reason to the backend
      const response = await axios.post(`${API_URL}/api/update-delivery/${delivery.delivery_id}/final`, {
        reason: selectedReason,
      });
      if (response.status === 200) {
        Alert.alert('Submitted', `Refund reason: ${selectedReason}`);
        onClose(); // Close the modal after submitting
      } else {
        Alert.alert('Error', 'Failed to submit refund reason');
      }
    } catch (error) {
      console.error('Error submitting refund reason:', error);
      Alert.alert('Error', 'An error occurred while submitting the refund reason.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlatList
      className="flex-1 p-5 bg-white"
      data={damagedProducts}
      keyExtractor={(item, index) => index.toString()}
      ListHeaderComponent={
        <>
          <Text className="text-3xl font-bold mb-5">Refund Details</Text>
          <View className="w-full mb-2 flex flex-row items-left items-center">
            <Text className="font-bold text-blue-600 text-xl mr-2">
              Purchase Order ID #:
            </Text>
            <Text className="text-black font-bold text-2xl">
              {delivery.purchase_order_id || 'N/A'}
            </Text>
          </View>
          <View className="w-full mb-2 flex flex-row items-left items-center">
            <Text className="font-bold text-blue-600 text-xl mr-2">
              Delivery ID #:
            </Text>
            <Text className="text-black font-bold text-2xl">
              {delivery.delivery_id || 'N/A'}
            </Text>
          </View>
          <View className="mb-2 flex flex-row items-center">
            <Text className="font-bold text-blue-600 text-xl mr-1">
              Status:
            </Text>
            <Text className="text-red-600 font-bold text-2xl rounded-md">
              {delivery.status === 'P' ? 'Pending Refund' : delivery.status || 'N/A'} - Refund Delivery
            </Text>
          </View>
          <Text className="text-2xl font-bold mt-5 mb-2">Products Has Damage:</Text>
        </>
      }
      renderItem={({ item }) => (
        <View 
            className="bg-gray-200 border-b border-gray-300 flex flex-row justify-between items-center px-2 py-2 mb-2 rounded-md shadow-md"
        >
          <View className='flex flex-col'>
            <Text className="font-bold text-md text-gray-900 flex-1 text-left">
                {item.product_name}
            </Text>
            <Text className="font-bold text-md text-gray-700">
              - Ordered Product: x{item.quantity}
            </Text>
            <Text className="font-bold text-md text-red-500">
              - Damage(s): x{item.no_of_damages}
            </Text>
          </View>
          <View className="flex flex-col items-end bg-red-500 p-1 rounded">
            <Text className="font-bold text-white text-xl">
              To refund: x{item.no_of_damages}
            </Text>
          </View>
        </View>
      )}
      ListFooterComponent={
        <>
          <View className="mt-5 p-4 bg-gray-200 rounded-md">
            <Text className="font-bold text-xl mb-2">Reason for Refund:</Text>
            <Picker
              selectedValue={selectedReason}
              onValueChange={(itemValue) => setSelectedReason(itemValue)}
              className='h-full w-full'
            >
              <Picker.Item label="Damaged Product" value="Damaged Product" />
              <Picker.Item label="Loss of Product while on Delivery" value="Loss of Product while on Delivery" />
              {/* <Picker.Item label="Expired Product" value="Expired Product" /> */}
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          <TouchableOpacity
            className="mt-5 p-4 bg-green-600 rounded-md items-center"
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text className="text-white font-bold text-xl">{loading ? 'Submitting...' : 'Submit'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="mt-5 p-4 bg-red-600 rounded-md items-center"
            onPress={onClose}
          >
            <Text className="text-white font-bold text-xl">Close</Text>
          </TouchableOpacity>
        </>
      }
    />
  );
};

export default RefundDetails;
