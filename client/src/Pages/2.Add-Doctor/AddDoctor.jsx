import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddDoctor = () => {
  const [doctorName, setDoctorName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fetchedSpecializations, setFetchedSpecializations] = useState([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [times, setTimes] = useState({
    MONDAY: [''],
    TUESDAY: [''],
    WEDNESDAY: [''],
    THURSDAY: [''],
    FRIDAY: [''],
    SATURDAY: [''],
    SUNDAY: ['']
  });

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await axios.get('http://localhost:4000/hospital-specializations', { withCredentials: true });
        setFetchedSpecializations(response.data.specializations);
      } catch (error) {
        console.error('Error fetching specializations:', error);
      }
    };

    fetchSpecializations();
  }, []);

  const handleAddTime = (day) => {
    setTimes((prevTimes) => ({
      ...prevTimes,
      [day]: [...prevTimes[day], '']
    }));
  };

  const handleTimeChange = (day, index, value) => {
    setTimes((prevTimes) => {
      const newTimes = { ...prevTimes };
      newTimes[day][index] = value;
      return newTimes;
    });
  };

  const handleSpecializationChange = (event, specializationId) => {
    const isChecked = event.target.checked;
  
    setSelectedSpecializations((prevSelectedSpecializations) => {
      if (isChecked) {
        // Add specialization to the list
        return [...prevSelectedSpecializations, specializationId];
      } else {
        // Remove specialization from the list
        return prevSelectedSpecializations.filter((s) => s !== specializationId);
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch('http://localhost:4000/add-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          DOCTOR_NAME: doctorName,
          CONTACT_NUMBER: contactNumber,
          USERNAME: username,
          PASSWORD: password,
          specializations: selectedSpecializations, // Use the selectedSpecializations state
          times,
        }),
        credentials: 'include', // Include credentials in the request
      });
  
      if (!response.ok) {
        // Handle non-2xx status codes
        throw new Error(`Request failed with status ${response.status}`);
      }
  
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error('Error submitting data:', error.message);
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Doctor Name:</label>
        <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
      </div>

      <div>
        <label>Contact Number:</label>
        <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
      </div>

      <div>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      
      <div>
  <label>Select Specializations:</label>
  {fetchedSpecializations.map((specialization) => (
    <div key={specialization.SPECIALIZATION_ID}>
      <input
        type="checkbox"
        value={specialization.SPECIALIZATION_ID}
        checked={selectedSpecializations.includes(specialization.SPECIALIZATION_ID)}
        onChange={(event) =>
          handleSpecializationChange(event, specialization.SPECIALIZATION_ID)
        }
      />
      <label>{specialization.SPECIALIZATION_NAME}</label>
    </div>
  ))}
</div>

      <div>
        <label>Select Time Slots:</label>
        {Object.keys(times).map((day) => (
          <div key={day}>
            <span>{day}:</span>
            {times[day].map((time, index) => (
              <div key={index}>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(day, index, e.target.value)}
                />
                {index === times[day].length - 1 && (
                  <button type="button" onClick={() => handleAddTime(day)}>
                    Add One More
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default AddDoctor;
