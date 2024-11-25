import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, TextInput, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios'; // Import axios
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../config';
import { useNavigation } from '@react-navigation/native'; // Import the hook

const Report = () => {
    const navigation = useNavigation(); // Initialize the navigation object

    const route = useRoute();
    const delivery = route.params.delivery;

    const [damageCounts, setDamageCounts] = useState({});
    const [comment, setComment] = useState('');
    const [photos, setPhotos] = useState([]); // Array to store multiple photo URIs
    const [modalVisible, setModalVisible] = useState(false); // For showing/hiding the modal
    const [selectedImage, setSelectedImage] = useState(null); // To hold the URI of the selected image

    // Function to handle the change of a particular damage input
    const handleDamageChange = (productId, newValue) => {
        setDamageCounts(prevState => ({
            ...prevState,
            [productId]: newValue || "0", // Set to "0" if the input is blank
        }));
    };

    // Function to handle the "Take Photo" button press
    const handleTakePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Camera access denied");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.cancelled && result.assets) {
            setPhotos(oldPhotos => [...oldPhotos, result.assets[0].uri]); // Append new photo to the array
        }
    };

    const handleImagePress = (uri) => {
        setSelectedImage(uri);
        setModalVisible(true);
    };

    // Function to handle the Submit button press
    const handleSubmit = async () => {
        try {
            const formData = new FormData();
    
            // Append notes, defaulting to "no comment" if empty
            formData.append('notes', comment.trim() === '' ? 'no comment' : comment.trim()); // Check if `comment` is blank and default
    
            // Append status
            formData.append('status', 'P'); // Always set to "P"
    
            // Append damages
            delivery.products.forEach((product) => {
                formData.append(`damages[${product.product_id}][product_id]`, product.product_id); // Include product_id
                formData.append(`damages[${product.product_id}][no_of_damages]`, damageCounts[product.product_id] || '0'); // Default to "0"
            });
    
            // Append images
            photos.forEach((photo, index) => {
                const fileName = photo.split('/').pop(); // Extract the file name
                formData.append('images[]', {
                    uri: photo, // Ensure this is a valid file URI
                    name: fileName || `photo_${index}.jpg`, // Add a fallback name
                    type: 'image/jpeg', // Adjust based on the file type
                });
            });
    
            // Log formData for debugging (optional)
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}:`, pair[1]);
            }
    
            // Send the POST request
            const response = await axios.post(`${API_URL}/api/update-delivery/${delivery.delivery_id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            // Handle success
            Alert.alert('Success', 'Delivery report submitted successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('OnGoingDeliveries'), // Navigate back to OnGoingDeliveries
                },
            ]);
        } catch (error) {
            console.error(error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.message || 'An error occurred while submitting the report.');
        }
    };
    

    return (
        <SafeAreaView className="flex-1 bg-white p-5">
            <ScrollView>
                <View className="mb-5 w-full flex flex-row justify-center items-center bg-blue-500 rounded-2xl p-2">
                    <Text className="text-2xl font-bold text-white">Delivery Report for ID: </Text>
                    <Text className="text-2xl font-bold bg-green-400 px-2 rounded text-white">
                        {delivery.delivery_id}
                    </Text>
                </View>

                {delivery ? (
                    <>
                        <View className="w-full mb-2 flex flex-row items-left items-center">
                            <Text className="font-bold text-blue-600 text-xl mr-2">Purchase Order ID #:</Text>
                            <Text className="text-black font-bold text-2xl">
                                {delivery.purchase_order_id || 'N/A'}
                            </Text>
                        </View>

                        <Text className="font-bold text-blue-600 text-xl mb-3">Products Delivered:</Text>
                        <View className="w-full mb-4">
                            {delivery.products.map((product, index) => (
                                <View key={index} className="flex flex-row justify-between py-2 mb-2 rounded-md bg-pink-200 px-2">
                                    <View>
                                        <Text className="font-bold text-xl text-gray-900 flex-1">
                                            {product.product_name}
                                        </Text>
                                        <Text className="font-bold text-xl text-gray-700 flex-1">
                                            x{product.quantity}
                                        </Text>
                                    </View>
                                    <View className="ml-4 flex items-center justify-center">
                                        <TextInput
                                            value={damageCounts[product.product_id] || ''}
                                            onChangeText={(newValue) => handleDamageChange(product.product_id, newValue)}
                                            placeholder="Damage number"
                                            placeholderTextColor="#888"
                                            className="border border-b-2 border-pink-600 rounded-md p-2"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                            ))}

                            <View className="w-full p-2 flex flex-col">
                                <Text className="font-bold text-blue-600 text-xl mb-2">Comment:</Text>
                                <TextInput
                                    value={comment}
                                    onChangeText={setComment}
                                    className="border rounded mb-4 p-2"
                                    placeholder="Comments regarding the delivery"
                                    placeholderTextColor="#888"
                                />
                                <TouchableOpacity
                                    className="bg-blue-500 p-3 rounded-md items-center mb-4"
                                    onPress={handleTakePhoto}
                                >
                                    <Text className="text-white font-bold">Take Photo</Text>
                                </TouchableOpacity>

                                {/* Display Photos */}
                                {photos.length > 0 && (
                                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex flex-row">
                                        {photos.map((photoUri, index) => (
                                            <View key={index} className="relative m-2">
                                                <TouchableOpacity
                                                    onPress={() => setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index))}
                                                    className="absolute -top-2 -right-2 bg-red-600 rounded-full p-2 z-10"
                                                >
                                                    <Text className="text-white font-bold text-sm">X</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleImagePress(photoUri)}>
                                                    <Image
                                                        source={{ uri: photoUri }}
                                                        className="rounded-xl w-[10rem] h-[10rem] border border-gray-400"
                                                        resizeMode="cover"
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}

                                {/* Submit Button */}
                                <TouchableOpacity
                                    className="bg-green-600 p-4 rounded-md items-center mt-4"
                                    onPress={handleSubmit}
                                >
                                    <Text className="text-white font-bold text-lg">Submit Report</Text>
                                </TouchableOpacity>

                                {/* Full-Screen Image Modal */}
                                <Modal
                                    animationType="slide"
                                    transparent={false}
                                    visible={modalVisible}
                                    onRequestClose={() => setModalVisible(false)}
                                >
                                    <View className="flex-1 bg-black">
                                        <TouchableOpacity
                                            onPress={() => setModalVisible(false)}
                                            className="absolute top-8 right-8 z-10 bg-red-600 p-3 rounded"
                                        >
                                            <Text className="text-white font-bold text-lg">Close</Text>
                                        </TouchableOpacity>
                                        <Image
                                            source={{ uri: selectedImage }}
                                            className="w-full h-full"
                                            resizeMode="contain"
                                        />
                                    </View>
                                </Modal>
                            </View>
                        </View>
                    </>
                ) : (
                    <Text className="text-center text-black">Loading delivery details...</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Report;
