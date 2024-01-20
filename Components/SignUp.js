import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';

const SignUp = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');


  const handleSignUp = async () => {
    console.log("hello");
    try {
      const response = await fetch('http://10.0.2.2:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phoneNumber, password}),
      });

      console.log('Response Status:', response.status);

      if (response.ok) {
        Alert.alert('Success', 'User registered successfully');
      } else {
        const data = await response.json();
        Alert.alert('Error', `Failed to sign up: ${data.message}`);
      }
    } catch (error) {
      console.error('Error during sign-up:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={(text) => setName(text)}
        style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}
      />
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
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

export default SignUp;
