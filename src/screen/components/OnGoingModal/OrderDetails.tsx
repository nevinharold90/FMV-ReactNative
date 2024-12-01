import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type Product = {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
};

type Delivery = {
  purchase_order_id: string;
  delivery_id: number;
  status: string;
  products: Product[];
};

interface OrderDetailsProps {
  delivery: Delivery;
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ delivery, onClose }) => {
  const navigation = useNavigation(); // Use the useNavigation hook to get the navigation object

  const handleReport = () => {
    navigation.replace('Report', { delivery });
  };


  return (
    <FlatList
      className="flex-1 p-5 bg-white"
      data={delivery.products}
      keyExtractor={(item, index) => index.toString()}
      ListHeaderComponent={
        <>
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
            <Text className="text-white font-bold text-xl">Report</Text>
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

export default OrderDetails;
