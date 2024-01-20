import React, { useState, useEffect } from 'react';
import './ManagementSignup.css'
import {NavLink , useNavigate} from 'react-router-dom'
import swal2 from 'sweetalert2'

const ManagementSignup = () => {
  const [hospitalName, setHospitalName] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [gmap, setGmap] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const navigate = useNavigate();

  const handleCheckboxChange = (specialization) => {
    if (specializations.includes(specialization)) {
      setSpecializations((prevSpecializations) =>
        prevSpecializations.filter((s) => s !== specialization)
      );
    } else {
      setSpecializations((prevSpecializations) => [...prevSpecializations, specialization]);
    }
  };

  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/add-hospital', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Hospital_name: hospitalName,
          Username: username,
          Location: location,
          password: password,
          address: address,
          Gmap: gmap,
          specializations: specializations,
        }),
      });
      if (response.ok) {
        swal2.fire({
          position: 'top-end',
          title: 'Hospital Adding Successful !',
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: 'my-custom-popup-class',
            title: 'my-custom-title-class',
            content: 'my-custom-content-class',
            timerProgressBar:'progress-bar',
          },
          didOpen: () => {
            swal2.showLoading();
            const b = swal2.getHtmlContainer().querySelector('b');
            timerInterval = setInterval(() => {
              b.textContent = swal2.getTimerLeft();
            }, 100);
          },
          }).then((result) => {
          if (result.dismiss === swal2.DismissReason.timer) {
            console.log('I was closed by the timer');
          }
          }); 
  
          navigate('../management-db');
      }
      else{
        swal2.fire({
          position: 'top-end',
          title: 'Fill Properly !',
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: 'my-custom-popup-class',
            title: 'my-custom-title-class',
            content: 'my-custom-content-class',
            timerProgressBar:'progress-bar',
          },
          didOpen: () => {
            swal2.showLoading();
            const b = swal2.getHtmlContainer().querySelector('b');
            timerInterval = setInterval(() => {
              b.textContent = swal2.getTimerLeft();
            }, 100);
          },
          }).then((result) => {
          if (result.dismiss === swal2.DismissReason.timer) {
            console.log('I was closed by the timer');
          }
          }); 
      }
      
    } catch (error) {
      console.error('Error adding hospital:', error);

      swal2.fire({
        position: 'top-end',
        title: 'Internal Error !',
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: 'my-custom-popup-class',
          title: 'my-custom-title-class',
          content: 'my-custom-content-class',
          timerProgressBar:'progress-bar',
        },
        didOpen: () => {
          swal2.showLoading();
          const b = swal2.getHtmlContainer().querySelector('b');
          timerInterval = setInterval(() => {
            b.textContent = swal2.getTimerLeft();
          }, 100);
        },
        }).then((result) => {
        if (result.dismiss === swal2.DismissReason.timer) {
          console.log('I was closed by the timer');
        }
        }); 

      
    }
  };

  return (
    <>
      <h2 className='M-signup-heading'>Add Hospital</h2>
<div className='M-signup-outer-panel'>
    <div className='M-signup-panel'> 

    <div className='M-signup-inner-panel'>
      <div className="M-signup-item">
        Hospital Name
        <input className='M-signup-input' type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
      </div>
      

      <div className="M-signup-item">
        Username
        <input className='M-signup-input' type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      

      <div className="M-signup-item">
        Location
        <input className='M-signup-input' type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
       

      <div className="M-signup-item">
        Password
        <input className='M-signup-input' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      

      <div className="M-signup-item">
        Address
        <input className='M-signup-input' type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      

      <div className="M-signup-item">
        G-map Link
        <input className='M-signup-input' type="text" value={gmap} onChange={(e) => setGmap(e.target.value)} />
      </div>
    
      

      <div className='M-signup-item-3'>
        Select Specializations :
        <div className="M-signup-item-2">

          <div className='item'>
            <input
              type="checkbox"
              value="Cardiology"
              checked={specializations.includes('Cardiology')}
              onChange={() => handleCheckboxChange('Cardiology')}
              className="plus-minus"
            />
            Cardiology
          </div>
          <div className='item'>
            <input
              type="checkbox"
              value="Orthopedics"
              checked={specializations.includes('Orthopedics')}
              onChange={() => handleCheckboxChange('Orthopedics')}
              className="plus-minus"
            />
            Orthopedics
          </div>
          <div className='item'>
            <input
              type="checkbox"
              value="neurology"
              checked={specializations.includes('neurology')}
              className="plus-minus"
              onChange={() => handleCheckboxChange('neurology')}
            />
            Neurology
          </div>
          <div className='item'>
            <input
              type="checkbox"
              value="Ophthalmology"
              checked={specializations.includes('Ophthalmology')}
              className="plus-minus"
              onChange={() => handleCheckboxChange('Ophthalmology')}
            />
            Ophthalmology
          </div>
          <div className='item'>
            <input
              type="checkbox"
              value="Dermatology"
              checked={specializations.includes('Dermatology')}
              className="plus-minus"
              onChange={() => handleCheckboxChange('Dermatology')}
            />
            Dermatology
          </div>

        </div>
      </div>

      </div>
      
      <div className='M-signup-button-panel'>
      <button onClick={handleAddHospital} className='M-signup-button'>Add Hospital</button>
      <NavLink className='M-signup-button' to='/management-db'>Go Back</NavLink>
      </div>

    </div>

      </div>

    </>
  );
};

export default ManagementSignup;
