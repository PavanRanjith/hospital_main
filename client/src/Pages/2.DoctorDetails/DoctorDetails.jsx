import React, { useState, useEffect } from 'react';
import { useParams , useNavigate} from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';

const DoctorDetails = () => {
  const { doctor_ID } = useParams();
  const [doctorDetails, setDoctorDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({
    DAY_OF_WEEK: '',
    OP_START_TIME: '',
  });
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/doctor/${doctor_ID}`);
        setDoctorDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        // Handle error state here
      }
    };

    fetchData();
  }, [doctor_ID]);

  const handleAddSlot = async () => {
    try {
      await axios.post(`http://localhost:4000/add-slot/${doctor_ID}`, newSlot);
      // Refresh the doctor details after adding the new slot
      const response = await axios.get(`http://localhost:4000/doctor/${doctor_ID}`);
      setDoctorDetails(response.data);
      setNewSlot({
        DAY_OF_WEEK: '',
        OP_START_TIME: '',
      });
    } catch (error) {
      console.error('Error adding slot:', error);
      // Handle error state here
    }
  };

  const handleDeleteSlot = async (dayOfWeek, opStartTime) => {
    try {
      await axios.delete(`http://localhost:4000/delete-slot/${doctor_ID}`, {
        data: {
          DAY_OF_WEEK: dayOfWeek,
          OP_START_TIME: opStartTime,
        },
      });
      // Refresh the doctor details after deleting the slot
      const response = await axios.get(`http://localhost:4000/doctor/${doctor_ID}`);
      setDoctorDetails(response.data);
    } catch (error) {
      console.error('Error deleting slot:', error);
      // Handle error state here
    }
  };

  const handleKickDoctor = async () => {
    try {
      await axios.post(`http://localhost:4000/kickDoctor/${doctor_ID}`);
      navigate('/home');
      // Redirect or perform additional actions after kicking the doctor
      console.log('Doctor kicked successfully');
    } catch (error) {
      console.error('Error kicking doctor:', error);
      // Handle error state here
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{doctorDetails.DOCTOR_NAME}</h1>
      <p>Contact Number: {doctorDetails.CONTACT_NUMBER}</p>
      <p>Username: {doctorDetails.USERNAME}</p>
      <p>
        Specializations:{' '}
        {doctorDetails.SPECIALIZATIONS.map((specialization, index) => (
          <span key={index}>
            {specialization}
            {index !== doctorDetails.SPECIALIZATIONS.length - 1 && ', '}
          </span>
        ))}
      </p>

      <h2>Available Slots</h2>
      <ul>
        {doctorDetails.SLOTS.map((slots, index) => (
          <li key={index}>
            <p>
              <strong>{getDayOfWeek(index + 1)}</strong>
            </p>
            <ul>
              {slots.map((startTime, slotIndex) => (
                <li key={slotIndex}>
                  {startTime}{' '}
                  <button onClick={() => handleDeleteSlot(getDayOfWeek(index + 1), startTime)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <h2>Add a Slot</h2>
<label>
  Day of Week:
  <select
    value={newSlot.DAY_OF_WEEK}
    onChange={(e) => setNewSlot({ ...newSlot, DAY_OF_WEEK: e.target.value })}
  >
    <option value="">SELECT A DAY</option>
    <option value="SUNDAY">Sunday</option>
    <option value="MONDAY">Monday</option>
    <option value="TUESDAY">Tuesday</option>
    <option value="WEDNESDAY">Wednesday</option>
    <option value="THURSDAY">Thursday</option>
    <option value="FRIDAY">Friday</option>
    <option value="SATURDAY">Saturday</option>
  </select>
</label>
<label>
  OP Start Time:
  <input
    type="time"
    value={newSlot.OP_START_TIME}
    onChange={(e) => setNewSlot({ ...newSlot, OP_START_TIME: e.target.value })}
  />
</label>
<button onClick={handleAddSlot}>Add Slot</button>


                   {/* Kick Doctor Button */}
      <button onClick={openModal}>Kick Doctor</button>

{/* Confirmation Modal */}
<Modal
  isOpen={modalIsOpen}
  onRequestClose={closeModal}
  contentLabel="Kick Doctor Confirmation Modal"
>
  <h2>Are you sure you want to kick this doctor?</h2>
  <button onClick={handleKickDoctor}>Confirm</button>
  <button onClick={closeModal}>Cancel</button>
</Modal>
    </div>
  );
};

// Function to get the name of the day based on the day index (1-7)
const getDayOfWeek = (dayIndex) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return daysOfWeek[dayIndex - 1];
};

export default DoctorDetails;
