import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import swal2 from 'sweetalert2'
import './PatientHistory.css'

const PatientHistory = () => {

  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  

  
  const fetchData = async () => {
    console.log("hi");
    try {
      const response = await fetch('http://localhost:4000/all-appointments', {
        method: 'GET',
        credentials: 'include', // Include credentials for cookie authentication
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to run the effect only once on component mount

  

  return (
    <>
      <h2 className='app-heading'>Appointment History</h2>
      <div className='app-panel'>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Contact Number</th>
            <th>Token Number</th>
            <th>Doctor Name</th>
            <th>Date of Appointment</th>
            <th>Slot Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments && appointments.length > 0 ? (
            appointments.map((appointment) => (
              <tr key={appointment.APPOINTMENT_ID}>
                
                <td>{appointment.PATIENT_NAME}</td>
                <td>{appointment.CONTACT_NUMBER}</td>
                <td>{appointment.TOKEN_NUMBER}</td>
                <td>{appointment.DOCTOR_NAME}</td>
                <td>{formatDate(appointment.DATE)}</td>
                <td>{appointment.OP_START_TIME}</td>
                <td>{appointment.APPOINTMENT_STATUS}</td>
              </tr>
            ))
          ) : 
          (
            <tr>
              <td colSpan="7" ><div className='app-heading'>No appointments found</div></td>
            </tr>
          )}
        </tbody>
      </table>
      <NavLink className='app-navlink' to='/home'>Go Back</NavLink>
      </div>
    </>
  );
};

export default PatientHistory;
