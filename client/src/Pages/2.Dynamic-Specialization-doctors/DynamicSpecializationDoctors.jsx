import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';

const DynamicSpecializationDoctors = () => {
  const { specializationId } = useParams();
  const [specializationName,setSpecializationName] = useState();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/specialized-doctors/${specializationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include your credentials here, for example, an authentication token
            'Authorization': `Bearer YOUR_AUTH_TOKEN`,
          },
          credentials: 'include', // Include credentials option
        });

        if (!response.ok) {
          throw new Error('Error fetching doctors');
        }

        const data = await response.json();
        setDoctors(data.doctors);
        setSpecializationName(data.specializationName);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchData();
  }, [specializationId]);

  return (
    <div>
      <h2 className='doc_heading'>Doctors of <span className='doc_heading_span'>{specializationName}</span></h2>
      {/* <ul>
        {doctors.map((doctor) => (
          <li key={doctor.id}>{doctor.doctor_name}</li>
        ))}
      </ul> */}
      <div className='doc_panel'>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Details</th>
           
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
    </div>
  );
};

export default DynamicSpecializationDoctors;
