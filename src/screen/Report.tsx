import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, TextInput, ScrollView, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../url';
import { useNavigation } from '@react-navigation/native';

const Report = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const delivery = route.params?.delivery;
  const [isNavigating, setIsNavigating] = useState(false);

  const [damageCounts, setDamageCounts] = useState({});
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  const handleDamageChange = (productId, newValue) => {
    setDamageCounts((prevState) => ({
      ...prevState,
      [productId]: newValue.replace(/^0+/, '') || '0',
    }));
  };

  const handleTakePhoto = async () => {
    try {
      if (isNavigating) return;
      setIsNavigating(true);

      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Camera access denied');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        setPhotos((prevPhotos) => [...prevPhotos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error while taking photo:', error);
      Alert.alert('Error', 'Unable to take photo. Please try again.');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleImagePress = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const removePhoto = (indexToRemove) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert('Error', 'Please take at least one photo to proceed.');
      return;
    }

    setLoading(true); // Show loading indicator

    const formData = new FormData();
    formData.append('notes', comment.trim() === '' ? 'no comment' : comment.trim());

    if (delivery && delivery.products && Array.isArray(delivery.products)) {
      delivery.products.forEach((product, index) => {
        const noOfDamages = damageCounts[product.product_id] || '0';
        formData.append(`damages[${index}][product_id]`, product.product_id);
        formData.append(`damages[${index}][no_of_damages]`, noOfDamages);
      });
    } else {
      console.error('Products array in delivery is undefined or not an array');
      Alert.alert('Error', 'There is a problem with the delivery data structure.');
      setLoading(false);
      return;
    }

    photos.forEach((photo, index) => {
      const fileName = photo.split('/').pop();
      formData.append('images[]', {
        uri: photo,
        name: fileName || `photo_${index}.jpg`,
        type: 'image/jpeg',
      });
    });

    try {
      const response = await axios.post(`${API_URL}/api/update-delivery/${delivery.delivery_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Delivery report submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setPhotos([]);
            setComment('');
            setDamageCounts({});
            setLoading(false); // Hide loading indicator
            navigation.navigate('My Deliveries');
          },
        },
      ]);
    } catch (error) {
      console.error('Error submitting delivery report:', error.response?.data || error.message);
      Alert.alert('Error', 'An error occurred while submitting the report.');
      setLoading(false); // Hide loading indicator on error
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <ScrollView>
        <View className="mb-5 w-full flex flex-row justify-center items-center bg-blue-500 rounded-2xl p-3">
          <Text className="text-2xl font-bold text-white">Delivery Report for ID: {delivery?.delivery_id}</Text>
        </View>
        {delivery ? (
          <>
            <View className="mb-5">
              <Text className="text-xl font-bold">Delivery ID: {delivery.delivery_id}</Text>
              <Text className="text-xl">Purchase Order ID: {delivery.purchase_order_id}</Text>
            </View>

            <Text className="text-lg font-bold mb-2">Damage Report:</Text>
            {delivery.products.map((product, index) => (
              <View key={index} className="mb-4">
                <Text className="text-xl font-bold text-blue-500">{product.product_name}</Text>
                <TextInput
                  className="border border-gray-300 rounded text-xl px-2 py-2 mt-2"
                  placeholder="Number of damages"
                  keyboardType="numeric"
                  value={damageCounts[product.product_id]?.toString() || '0'}
                  onChangeText={(text) => handleDamageChange(product.product_id, text)}
                />
              </View>
            ))}

            <View className="mb-5">
              <Text className="text-lg font-bold">Comments (Optional):</Text>
              <TextInput
                className="border border-gray-300 rounded px-2 py-2 mt-2 h-24 text-left"
                multiline
                numberOfLines={4}
                placeholder="Add any comments..."
                value={comment}
                onChangeText={setComment}
              />
            </View>

            <View className="mb-5">
              <Text className="text-lg font-bold">Photos (Required):</Text>
              {photos.length > 0 ? (
                <ScrollView horizontal className="mt-3">
                  {photos.map((photoUri, index) => (
                    <View key={index} className="mr-3">
                      <TouchableOpacity onPress={() => handleImagePress(photoUri)}>
                        <Image source={{ uri: photoUri }} className="w-[100px] h-[100px] rounded" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removePhoto(index)}
                        className="mt-2 bg-red-500 p-1 rounded"
                      >
                        <Text className="text-white text-center">Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text className="text-sm text-gray-500">No photos taken yet.</Text>
              )}
            </View>

            {loading ? (
              <View className="mt-5">
                <ActivityIndicator size="large" color="#007BFF" />
              </View>
            ) : (
              <>
                <TouchableOpacity onPress={handleTakePhoto} className="bg-green-500 p-3 rounded mb-5">
                  <Text className="text-white text-lg text-center">Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSubmit} className="bg-blue-500 p-3 rounded">
                  <Text className="text-white text-lg text-center">Submit Report</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          <Text>Loading delivery details...</Text>
        )}
      </ScrollView>

      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)} transparent>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg">
            {selectedImage && <Image source={{ uri: selectedImage }} className="w-[300px] h-[500px]" />}
            <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-5">
              <Text className="text-center text-red-500">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Report;
