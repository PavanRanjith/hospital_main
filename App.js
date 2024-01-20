import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import HospitalView from './Components/HospitalView';
import SpecializationPage from './Components/SpecializationPage';
import DoctorPage from './Components/DoctorPage';
import SlotPage from './Components/SlotPage';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="HospitalView" component={HospitalView} />
    <Stack.Screen name="DoctorPage" component={DoctorPage} />
  </Stack.Navigator>
);

const AuthStack1 = () => (
  <Stack.Navigator initialRouteName="HospitalView">
    <Stack.Screen name="HospitalView" component={HospitalView} options={{ title: 'Hospital List' }} />
    <Stack.Screen name="SpecializationPage" component={SpecializationPage} options={{ title: 'Specializations' }} />
    <Stack.Screen name="DoctorPage" component={DoctorPage} options={{ title: 'Doctors' }} />
    <Stack.Screen name="SlotPage" component={SlotPage} options={{ title: 'Slots' }} />
  </Stack.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="SignUp" component={SignUp} />
        <Tab.Screen name="Auth" component={AuthStack} />
        <Tab.Screen name="Auth1" component={AuthStack1} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
