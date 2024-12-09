import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../url'; // Make sure this is correct
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login: React.FC = () => {
  const navigation = useNavigation();

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const login = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        username,
        password,
      });

      // Uncomment this line to see the full response for debugging:
      console.log('Login Response:', response.data);

      if (response.status === 200 && response.data.success) {
        const user = response.data.user;

        // Store user data in AsyncStorage
        await AsyncStorage.setItem('deliveryman_name', user.name);
        await AsyncStorage.setItem('deliveryman_id', user.id.toString());
        await AsyncStorage.setItem('deliveryman_token', response.data.token);
        await AsyncStorage.setItem('isLoggedIn', 'true'); // Mark user as logged in

        // Navigate to Home page
        navigation.navigate('HomeScreen', {
          deliveryman_id: user.id.toString(),
        });
      } else if (response.status === 401) {
        Alert.alert('Error', 'Invalid credentials. Please try again.');
      } else if (response.data) {
        Alert.alert(
          'Login Failed',
          response.data.message || 'Login failed for unknown reasons.'
        );
      } else {
        Alert.alert('Login Failed', 'Invalid credentials');
      }
    } catch (e: any) {
      // Uncomment these lines to debug error details:
      console.log('Login Error:', e);
      console.log('Login Error Response:', e.response);

      if (e.response && e.response.status === 401) {
        Alert.alert('Error', 'Unauthorized: Incorrect username or password.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View className="w-full items-center">
            <Text className="text-black font-bold text-2xl text-center">
              FMV MOBILE APP DELIVERY
            </Text>
          </View>

          {/* Logo */}
          <View className="mt-12 mb-8 w-full items-center">
            <Image
              source={require('./../assets/login/Logo.png')}
              className="w-4/5 h-64"
              resizeMode="contain"
            />
          </View>

          {/* Username Input */}
          <View className="flex-row items-center mt-5 w-[90%] bg-white rounded-2xl p-5 shadow-md">
            <FontAwesome name="user" size={24} color="black" />
            <TextInput
              className="flex-1 ml-2"
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="default"
            />
          </View>

          {/* Password Input */}
          <View className="flex-row items-center mt-5 w-[90%] bg-white rounded-2xl p-5 shadow-md">
            <FontAwesome name="lock" size={24} color="black" />
            <TextInput
              className="flex-1 ml-2"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <MaterialIcons
                name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="mt-11 w-[90%] bg-blue-500 rounded-2xl p-5 items-center"
            onPress={login}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-bold">Login</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
