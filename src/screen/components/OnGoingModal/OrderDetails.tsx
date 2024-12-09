import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const OrderDetails = ({ delivery, onClose }) => {
  const navigation = useNavigation();

  const handleReport = () => {
    if (delivery && delivery.delivery_id) {
      onClose();
      navigation.navigate('Report', { delivery });
    } else {
      Alert.alert('Error', 'No delivery data available');
    }
  };

  const products = delivery.products || [];

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <View className="flex-1 p-5 bg-white">
        <Text className="text-red-500">No products found in this delivery.</Text>
        <TouchableOpacity
          className="mt-5 p-4 bg-red-600 rounded-md items-center"
          onPress={onClose}
        >
          <Text className="text-white font-bold text-xl">Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-3xl font-bold mb-5">Order Details</Text>
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
        <Text className="text-green-600 font-bold text-2xl rounded-md">
          {delivery.status === 'OD' ? 'On Delivery' : delivery.status || 'N/A'}
        </Text>
      </View>

      <ScrollView className="mt-5">
        {products.map((item, index) => {
          const productName = item.name || item.product_name || 'Unnamed Product';
          const quantity = item.quantity || 0;
          return (
            <View
              key={item.id ? item.id.toString() : `product-${index}`}
              className="bg-gray-200 border-b border-gray-300 flex flex-row justify-between items-center px-2 py-2 mb-2 rounded-md shadow-md"
            >
              <Text className="font-bold text-xl text-gray-900 flex-1 text-left">
                {productName}
              </Text>
              <Text className="font-bold text-xl text-gray-700 flex-1 text-right">
                Delivered: x{quantity}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        className="mt-5 p-4 bg-blue-500 rounded-md items-center"
        onPress={handleReport}
      >
        <Text className="text-white font-bold text-xl">Report</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="mt-5 p-4 bg-red-600 rounded-md items-center"
        onPress={onClose}
      >
        <Text className="text-white font-bold text-xl">Close</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderDetails;
