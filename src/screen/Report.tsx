import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, TextInput, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../config';
import { useNavigation } from '@react-navigation/native';

const Report = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const delivery = route.params?.delivery;  // Make sure delivery is passed as a parameter
    const [isNavigating, setIsNavigating] = useState(false);

    const [damageCounts, setDamageCounts] = useState({});
    const [comment, setComment] = useState('');
    const [photos, setPhotos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleDamageChange = (productId, newValue) => {
        setDamageCounts(prevState => ({
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
                setIsNavigating(false);
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 1,
            });
            if (!result.canceled && result.assets?.length) {
                setPhotos(oldPhotos => [...oldPhotos, result.assets[0].uri]);
            }
        } catch (error) {
            console.error('Error while taking photo:', error);
            Alert.alert('Error', 'Unable to take photo. Please try again.');
        } finally {
            // Ensure navigation stays on `report.tsx` after taking a photo
            setIsNavigating(false);
        }
    };

    const handleImagePress = uri => {
        setSelectedImage(uri);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        // Check if at least one photo is taken
        if (photos.length === 0) {
            Alert.alert('Error', 'Please take at least one photo to proceed.');
            return;
        }

        const formData = new FormData();

        // Append notes
        formData.append('notes', comment.trim() === '' ? 'no comment' : comment.trim());

        // Append damages using the correct array format
        if (delivery && delivery.products && Array.isArray(delivery.products)) {
            delivery.products.forEach((product, index) => {
                const noOfDamages = damageCounts[product.product_id] || '0';

                // Append product_id and no_of_damages to formData
                formData.append(`damages[${index}][product_id]`, product.product_id);
                formData.append(`damages[${index}][no_of_damages]`, noOfDamages);
            });
        } else {
            console.error("Products array in delivery is undefined or not an array");
            Alert.alert('Error', 'There is a problem with the delivery data structure.');
            return;
        }

        // Append images
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
                { text: 'OK', onPress: () => navigation.navigate('OnGoingDeliveries') },
            ]);
        } catch (error) {
            console.error('Error submitting delivery report:', error.response?.data || error.message);
            Alert.alert('Error', 'An error occurred while submitting the report.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-5">
            <ScrollView>
                <View className="mb-5 w-full flex flex-row justify-center items-center bg-blue-500 rounded-2xl p-2">
                    <Text className="text-2xl font-bold text-white">Delivery Report for ID: {delivery.delivery_id}</Text>
                </View>
                {delivery ? (
                    <>
                        <View className="w-full mb-2 flex flex-row items-left items-center">
                            <Text className="font-bold text-blue-600 text-xl mr-2">Purchase Order ID #:</Text>
                            <Text className="text-black font-bold text-2xl">{delivery.purchase_order_id || 'N/A'}</Text>
                        </View>
                        <Text className="font-bold text-blue-600 text-xl mb-3">Products Delivered:</Text>
                        {delivery.products.map((product, index) => (
                            <View key={index} className="flex flex-row justify-between py-2 mb-2 rounded-md bg-pink-200 px-2">
                                <View className='flex flex-row w-2/3 justify-around items-center'>
                                    <Text className="font-bold text-xl w-1/3 text-gray-700">x{product.quantity}</Text>
                                    <Text className="font-bold text-md w-2/3 text-gray-900">{product.product_name}</Text>
                                </View>
                                <View className='flex flex-row w-1/3 justify-end items-center p-1'>
                                    <Text className="font-bold text-xl text-gray-700 text-right ">x</Text>
                                    <TextInput
                                        value={damageCounts[product.product_id] || ''}
                                        onChangeText={newValue => handleDamageChange(product.product_id, newValue)}
                                        placeholder="damage"
                                        keyboardType="numeric"
                                        className="border ml-2 border-b-2 w-2/3 border-pink-600 rounded-md text-center"
                                    />
                                </View>
                            </View>
                        ))}
                        <View >
                            <Text>
                                Comment
                            </Text>                        
                            <TextInput
                                value={comment}
                                onChangeText={setComment}
                                placeholder="Comments regarding the delivery"
                                className="border rounded mb-4 p-2 text-blue-600 text-xl"
                            />
                        </View>

                        <TouchableOpacity className="bg-blue-500 p-3 rounded-md items-center mb-4" onPress={handleTakePhoto}>
                            <Text className="text-white font-bold">Take Photo</Text>
                        </TouchableOpacity>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            {photos.map((photoUri, index) => (
                                <TouchableOpacity key={index} onPress={() => handleImagePress(photoUri)} className="mb-2 mx-2">
                                    <Image source={{ uri: photoUri }} className="w-[10rem] h-[10rem] rounded-md" resizeMode="cover" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity className="bg-green-600 p-4 rounded-md items-center" onPress={handleSubmit}>
                            <Text className="text-white font-bold text-lg">Submit Report</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text className="text-center text-black">Loading delivery details...</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Report;
