import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './AllDoctors.css'

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/full-doctors', {
          method: 'GET',
          credentials: 'include', // Include credentials for cookie authentication
        });

        if (response.ok) {
          const data = await response.json();
          setDoctors(data.doctors);
        } else {
          console.error('Failed to fetch doctors');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run the effect only once on component mount

  return (
    <>
      <h2 className='doc_heading'>Doctor List</h2>
      <div className='doc_panel'>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>DOCTOR Name</th>
            <th>Details</th>
            {/* Add more columns as needed */}
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.DOCTOR_ID}>
              <td>{doctor.DOCTOR_ID}</td>
              <td>{doctor.DOCTOR_NAME}</td>
              <td><NavLink className='doc_navlink' to={`/doctor/${doctor.DOCTOR_ID}`}>More</NavLink></td>
            </tr>
          ))}
        </tbody>
      </table>
      <NavLink className='doc_navlink_2' to='/home'>Go Back</NavLink>
      </div>
    </>
  );
};

export default AllDoctors;
