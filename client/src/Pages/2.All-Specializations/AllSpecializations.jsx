import React, { useEffect, useState } from 'react';
import {NavLink} from 'react-router-dom';
import axios from 'axios';
import './AllSpecializations.css'

const AllSpecializations = () => {
  const [specializations, setSpecializations] = useState([]);
  const [hospitalDetails, setHospitalDetails] = useState([]);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await axios.get('http://localhost:4000/all-specializations',{withCredentials: true});
        setHospitalDetails(response.data.hospital_details);
        setSpecializations(response.data.specializations);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSpecializations();
  }, []);

  return (
    <>
      <div className='spec-heading'><h2 className='spec-sub-heading-1'>Username: <span className='spec-span'>{hospitalDetails.USERNAME}</span></h2><h1 className='spec-sub-heading-1'>{hospitalDetails.HOSPITAL_NAME}</h1> <NavLink className='spec-nav-item-2' to='/logout'><div className='spec-logout-button'>Logout</div></NavLink></div>
      <div className='line'></div>
      <div className='spec-heading-2'>Available Specializations</div>

      {/* <div className='spec-panel'>
        {specializations.map((specialization, index) => (
          <NavLink to='/specializations:id' className='spec-nav-item'><div key={index} className='spec-item'>{specialization}</div> </NavLink>
        ))}
      </div> */}

      <div className='spec-panel'>
      {specializations.map((specialization, index) => (
      <NavLink to={`/specializations/${index + 1}`} className='spec-nav-item' key={index}>
      <div className='spec-item'>{specialization}</div>
      </NavLink>
      ))}
      
      </div>

      <div className='line'></div>
      <div className='spec-options'>
         <NavLink className='spec-nav-item-2' to="/all-doctors"><div className='option-button'>All-Doctors</div></NavLink> 
         <NavLink className='spec-nav-item-2' to="/add-doctor"><div className='option-button'>Add-Doctor</div></NavLink> 
         <NavLink className='spec-nav-item-2' to="/onspot-registration"><div className='option-button'>On-spot Booking</div></NavLink> 
         <NavLink className='spec-nav-item-2' to="/appointments"><div className='option-button'>Appointments</div></NavLink> 
         {/* <NavLink className='spec-nav-item-2' to="/profile"><div className='option-button'>Change<br/>Password</div></NavLink>  */}
      </div>

    </>
  );
};
export default AllSpecializations;