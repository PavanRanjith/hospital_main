import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './ManagementsDB.css';

const ManagementsDB = () => {
  const [hospitals, setHospitals] = useState([]);
  const [editHospitalID, setEditHospitalID] = useState(null);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/all-hospitals', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setHospitals(data);
        } else {
          console.error('Failed to fetch hospitals');
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (hospitalID, currentUsername) => {
    setEditHospitalID(hospitalID);
    setNewUsername(currentUsername);
  };

  const handleCancelEdit = () => {
    setEditHospitalID(null);
    setNewUsername('');
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:4000/edit-hospital/${editHospitalID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newUsername }),
      });

      if (response.ok) {
        // Refresh the hospitals data after edit
        const updatedHospitals = hospitals.map((hospital) =>
          hospital.HOSPITAL_ID === editHospitalID
            ? { ...hospital, USERNAME: newUsername }
            : hospital
        );
        setHospitals(updatedHospitals);
        setEditHospitalID(null);
        setNewUsername('');
      } else {
        console.error(`Failed to edit hospital with ID ${editHospitalID}`);
      }
    } catch (error) {
      console.error('Error editing hospital:', error);
    }
  };

  return (
    <>
      <h2 className='M-heading'>All Hospitals</h2>
      <div className='M-table-div'>
        <table className='M-table'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Hospital Name</th>
              <th>Username</th>
              <th>Location</th>
              <th>Address</th>
              <th>Google Maps</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {hospitals.map((hospital) => (
              <tr key={hospital.HOSPITAL_ID}>
                <td>{hospital.HOSPITAL_ID}</td>
                <td>{hospital.HOSPITAL_NAME}</td>
                <td>
                  {editHospitalID === hospital.HOSPITAL_ID ? (
                    <input
                      type='text'
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                    />
                  ) : (
                    hospital.USERNAME
                  )}
                </td>
                <td>{hospital.LOCATION}</td>
                <td>{hospital.ADDRESS}</td>
                <td>{hospital.GMAP}</td>
                <td>
                  {editHospitalID === hospital.HOSPITAL_ID ? (
                    <>
                      <button onClick={handleSaveEdit}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => handleEdit(hospital.HOSPITAL_ID, hospital.USERNAME)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='M-Button-div'>
          <NavLink to='/management-signup' className='M-Button'>
            Add a Hospital
          </NavLink>
          <NavLink to='/admin-login' className='M-Button'>
            Logout
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default ManagementsDB;
