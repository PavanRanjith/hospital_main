import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import swal2 from 'sweetalert2'
import './Profile.css'

const Profile = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reEnterPassword, setReEnterPassword] = useState('');
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    try {
      if(newPassword=='' || reEnterPassword==''){
        swal2.fire({
          position: 'top-end',
          title: 'Fill the field properly !',
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
        return;
      }
      if (newPassword !== reEnterPassword) {
        swal2.fire({
          position: 'top-end',
          title: 'Password does not match !',
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
        return;
      }
      const response = await fetch('http://localhost:4000/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (response.ok) {
        swal2.fire({
          position: 'top-end',
          title: 'Password Changed !',
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
          navigate('/home');
      } else {
        const data = await response.json();
        swal2.fire({
          position: 'top-end',
          title: 'Wrong Old Password !',
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
      console.error('Error changing password:', error);
      swal2.fire({
        position: 'top-end',
        title: 'Internal Server Error !',
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

    <h2 className='M-pass-heading'>Change Password</h2>

    <div className='M-pass-outer-panel'>
    <div className='M-pass-inner-panel'>
      
      <div className='M-pass-item'>
          Old Password:
          <input className='M-pass-input' type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
      </div>

      <div className='M-pass-item'>
          New Password:
          <input className='M-pass-input' type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>

      <div className='M-pass-item'>
          Re-Enter Password:
          <input className='M-pass-input' type="password" value={reEnterPassword} onChange={(e) => setReEnterPassword(e.target.value)} />
      </div>
      
      <button onClick={handleChangePassword} className='M-pass-button'>Change Password</button>
      
    </div>
      <NavLink to='/home' className='M-pass-navlink'>Go Back</NavLink>
    </div>

  </>
  );
};

export default Profile;