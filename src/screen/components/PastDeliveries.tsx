import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image, RefreshControl, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../url';
import { SafeAreaView } from 'react-native-safe-area-context';
import hamburger from '../../assets/dashboard/modal/menu-svgrepo-com.png';
import { NavigationProp } from '@react-navigation/native';

interface PastDeliveriesProps {
  navigation: NavigationProp<any>;
}

const PastDeliveries: React.FC<PastDeliveriesProps> = ({ navigation }) => {
  const [id, setID] = useState(''); // ID of the deliveryman
  const [token, setToken] = useState(''); // Token for authentication
  const [deliveries, setDeliveries] = useState([]); // State to store all deliveries
  const [selectedStatus, setSelectedStatus] = useState<string>('S'); // Default status 'S'
  const [refreshing, setRefreshing] = useState(false); // State for refreshing

  // Fetch data immediately when the component mounts
  useEffect(() => {
    const loadData = async () => {
      const storedId = await AsyncStorage.getItem('deliveryman_id');
      const storedToken = await AsyncStorage.getItem('deliveryman_token');
  
      if (storedId && storedToken) {
        setID(storedId); // Set ID for deliveryman
        setToken(storedToken); // Set Token for authorization
        fetchData(storedId, storedToken); // Fetch data when the screen is loaded
      } else {
        Alert.alert('Error', 'Unable to retrieve deliveryman credentials');
      }
    };
  
    loadData(); // Call loadData function
  }, []); // Empty dependency array to call once on mount

  // Function to fetch deliveries based on the selected status
  const fetchData = async (storedId: string, storedToken: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/my-deliveries/on-deliveryman/${storedId}`,
        {
          params: { status: selectedStatus }, // Ensure selectedStatus is passed here
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
          timeout: 5000, // 5 seconds timeout
        }
      );
      
      if (response.status === 200) {
        const validDeliveries = response.data.filter(
          (item) => item.delivery_id && item.status === selectedStatus
        );
        setDeliveries(validDeliveries); // Set deliveries to state
      } else {
        console.error('Error', 'Failed to fetch deliveries.');
      }
    } catch (error) {
      console.log('Error fetching deliveries:', error);
      console.log('Error', 'Unable to fetch deliveries. Please try again.');
    } finally {
      setRefreshing(false); // Stop refreshing state
    }
  };

  // Refresh handler when user pulls down
  const handleRefresh = async () => {
    setRefreshing(true); // Set refreshing state to true
    await fetchData(id, token); // Fetch deliveries with the selected status
    setRefreshing(false); // Set refreshing state back to false after fetching data
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center mb-5">
        <TouchableOpacity className="p-2" onPress={() => navigation.openDrawer()}>
          <Image
            source={hamburger}
            className="w-10 h-10"
          />
        </TouchableOpacity>
        <Text className="text-2xl font-bold ml-3">
          Past Deliveries
        </Text>
      </View>

      {/* Deliveries List */}
      {deliveries.length > 0 ? (
        <FlatList
          className="p-5"
          data={deliveries}
          keyExtractor={(item) =>
            item.delivery_id ? item.delivery_id.toString() : `${Math.random()}`
          }
          renderItem={({ item }) => (
            <View
              className={`mb-4 p-5 bg-gray-200 rounded-lg shadow-md border ${item.has_damages ? 'border-red-500' : 'border-blue-500'}`}
            >
              <View className=" w-full flex flex-row items-center px-1">
                <Text className={`font-bold text-xl ${item.has_damages ? 'text-red-500' : 'text-blue-600'}`}>POID No:</Text>
                <Text className="text-black font-bold text-2xl">#{item.purchase_order_id || 'N/A'}</Text>
              </View>
              <View className="mb-2 w-full flex flex-row items-center px-1">
                <Text className={`font-bold text-xl ${item.has_damages ? 'text-red-500' : 'text-blue-600'}`}>Delivery ID:</Text>
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
                
              <View className={`p-4 rounded-2xl ${item.has_damages ? 'bg-red-500' : 'bg-blue-500'}`}>
                <Text className='text-white font-bold'>
                  Note:
                </Text>
                <Text className="mt-2  text-lg font-bold text-white">
                  {item.has_damages ? '"Successful with Damage/Loss of Products Refunded"' : '"Successful Delivery without Damage/Loss of products"'}
                </Text>
              </View>

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
          <Text className="text-center text-black">No delivery data available</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PastDeliveries;
