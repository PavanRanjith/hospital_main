// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView } from 'react-native';
// import { Card } from 'react-native-elements';

// const HospitalView = () => {
//   const [hospitals, setHospitals] = useState([]);

//   useEffect(() => {
//     // Fetch data when the component mounts
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       // Replace 'your-api-endpoint' with the actual endpoint to fetch hospital data
//       const response = await fetch('http://10.0.2.2:5000/api/hospitals');
//       const data = await response.json();
//       setHospitals(data); // Update the state with the fetched data
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   return (
//     <ScrollView >
//       <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, alignSelf:'center'}}>Hospital List</Text>
//       {hospitals.map((item) => (
//         <Card key={item.HOSPITAL_ID} containerStyle={{ borderRadius: 10, marginBottom: 10, shadowColor: '#90EE90', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 }}>
//           <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.HOSPITAL_NAME}</Text>
//           <Text>{item.ADDRESS}</Text>
          
//         </Card>
//       ))}
//     </ScrollView>
//   );
// };

// export default HospitalView;


import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const HospitalView = () => {
  const [hospitals, setHospitals] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch data when the component mounts
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Replace 'your-api-endpoint' with the actual endpoint to fetch hospital data
      const response = await fetch('http://10.0.2.2:5000/api/hospitals');
      const data = await response.json();
      setHospitals(data); // Update the state with the fetched data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleHospitalClick = async (hospitalId) => {
    try {
      // Fetch specialization data based on the hospitalId
      const specializationResponse = await fetch(`http://10.0.2.2:5000/api/hospital_specialization_mapping/${hospitalId}`);
      console.log(hospitalId);
      const specializationText = await specializationResponse.text();
  
      // Check if the response is valid JSON
      let specializationData;

    try {
      specializationData = JSON.parse(specializationText);
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);

      // Handle specific error conditions
      if (specializationResponse.status === 404) {
        console.error('Hospital specialization mapping not found.');
        throw new Error('Hospital specialization mapping not found.');
      } else {
        console.log("error");
      }
    }
      // Extract specialization IDs from the mapping data
      const specializationIds = specializationData.map(item => item.SPECIALIZATION_ID);
  
      // Fetch specialization names based on the specialization IDs
      const specializationNamesResponse = await fetch(`http://10.0.2.2:5000/api/specializations?ids=${specializationIds.join(',')}`);
  
      if (!specializationNamesResponse.ok) {
        throw new Error(`Error fetching specialization names. Status: ${specializationNamesResponse.status}`);
      }
  
      const specializationNamesData = await specializationNamesResponse.json();
      console.log(specializationNamesData);
  
      // Extract specialization names
      const specializationNames = specializationNamesData.map(item => item.SPECIALIZATION);
      const specializationid = specializationNamesData.map(item=>item.SPECIALIZATION_ID);
     
      // Navigate to the specialization page with the data
      navigation.navigate('SpecializationPage', { specializationNames, specializationid, hospitalId });
    } catch (error) {
      console.error('Error fetching specialization data:', error);
    }
  };
  

  return (
    <ScrollView>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, alignSelf: 'center' }}>Hospital List</Text>
      {hospitals.map((item) => (
        <TouchableOpacity key={item.HOSPITAL_ID} onPress={() => handleHospitalClick(item.HOSPITAL_ID)}>
          <Card containerStyle={{ borderRadius: 10, marginBottom: 10, shadowColor: '#90EE90', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.HOSPITAL_NAME}</Text>
            <Text>{item.ADDRESS}</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default HospitalView;

