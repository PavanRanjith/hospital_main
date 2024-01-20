import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        Alert.alert('Error', `Login failed: ${data.message}`);
        return;
      }

      const { token } = await response.json();

      await AsyncStorage.setItem('userToken', token);

      console.log(token);

      Alert.alert('Success', 'Login successful', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('HospitalView');
          },
        },
      ]);

    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(text)}
        keyboardType="numeric"
        style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
        style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default Login;
