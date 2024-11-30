import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

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
  // Filter products that have damages
  const damagedProducts = delivery.products.filter(
    (product) => product.no_of_damages && product.no_of_damages > 0
  );

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
