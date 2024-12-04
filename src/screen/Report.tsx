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
    const [photos, setPhotos] = useState([]);  // Photos are now required
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleDamageChange = (productId, newValue) => {
        setDamageCounts(prevState => ({
            ...prevState,
            [productId]: newValue.replace(/^0+/, '') || '0',
        }));
    };

    // Remove setModalVisible(true) from here in handleTakePhoto
    const handleTakePhoto = async () => {
        try {
            if (isNavigating) return;  // Prevent multiple presses
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
                setPhotos(prevPhotos => [...prevPhotos, result.assets[0].uri]);
            }
        } catch (error) {
            console.error('Error while taking photo:', error);
            Alert.alert('Error', 'Unable to take photo. Please try again.');
        } finally {
            setIsNavigating(false);
        }
    };
    

    const handleImagePress = uri => {
        setSelectedImage(uri);
        setModalVisible(true);  // Only triggered when an image is tapped
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
                {
                    text: 'OK',
                    onPress: () => {
                        // Clear all form data
                        setPhotos([]);
                        setComment('');
                        setDamageCounts({});
                        navigation.navigate('My Deliveries');
                    },
                },
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
                        <View className="mb-5">
                            <Text className="text-lg font-bold">Delivery ID: {delivery.delivery_id}</Text>
                            <Text className="text-sm">Purchase Order ID: {delivery.purchase_order_id}</Text>
                        </View>

                        <Text className="text-lg font-bold mb-2">Damage Report:</Text>
                        {delivery.products.map((product, index) => (
                            <View key={product.product_id} className="mb-4">
                                <Text className="text-sm">{product.product_name}</Text>
                                <TextInput
                                    style={{
                                        borderColor: '#ccc',
                                        borderWidth: 1,
                                        borderRadius: 4,
                                        padding: 8,
                                        marginTop: 8,
                                    }}
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
                                style={{
                                    borderColor: '#ccc',
                                    borderWidth: 1,
                                    borderRadius: 4,
                                    padding: 8,
                                    height: 100,
                                    textAlignVertical: 'top',
                                    marginTop: 8,
                                }}
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
                                        <TouchableOpacity key={index} onPress={() => handleImagePress(photoUri)}>
                                            <Image
                                                source={{ uri: photoUri }}
                                                style={{ width: 100, height: 100, marginRight: 10, borderRadius: 10 }}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            ) : (
                                <Text className="text-sm text-gray-500">No photos taken yet.</Text>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={handleTakePhoto}
                            style={{
                                backgroundColor: '#4CAF50',
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 20,
                            }}
                        >
                            <Text className="text-white text-lg text-center">Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            style={{
                                backgroundColor: '#007BFF',
                                padding: 12,
                                borderRadius: 8,
                            }}
                        >
                            <Text className="text-white text-lg text-center">Submit Report</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text>Loading delivery details...</Text>
                )}
            </ScrollView>

            {/* Modal for viewing image */}
            <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)} transparent={true}>
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="bg-white p-5 rounded-lg">
                        {selectedImage && (
                            <Image source={{ uri: selectedImage }} style={{ width: 300, height: 300 }} />
                        )}
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text className="text-center text-red-500 mt-5">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Report;
