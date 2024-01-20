import React from 'react'
import {Routes, Route} from "react-router-dom"

// Pages
import AdminLogin from './Pages/1.Admin-Login/AdminLogin'
import ManagementsDB from './Pages/1.Management-DB/ManagementsDB'
import ManagementSignup from './Pages/1.Management-Signup/ManagementSignup'
import AddDoctor from './Pages/2.Add-Doctor/AddDoctor'
import AllDoctors from './Pages/2.All-Doctors/AllDoctors'
import AllSpecializations from './Pages/2.All-Specializations/AllSpecializations'
import DynamicSpecializationDoctors from './Pages/2.Dynamic-Specialization-doctors/DynamicSpecializationDoctors'
import DoctorDetails from './Pages/2.DoctorDetails/DoctorDetails'
import ManagementLogin from './Pages/2.Management-Login/ManagementLogin'
import PatientHistory from './Pages/2.Patient-History/PatientHistory'
import Profile from './Pages/2.Profile/Profile'
import Onspot from './Pages/2.Onspot-Booking/Onspot'
import Logout from './Pages/2.Logout/Logout'

const Routing = () =>
{
  return(
    <Routes>      

      {/* Admin Pages */}
      <Route path="/admin-login" element={<AdminLogin/>} /> 
      <Route path="/management-db" element={<ManagementsDB/>} /> 
      <Route path="/management-signup" element={<ManagementSignup/>} /> 
      {/* User Pages */}
      <Route path="/" element={<ManagementLogin/>} /> 
      <Route path="/home" element={<AllSpecializations/>} /> 
      <Route path="/specializations/:specializationId" element={<DynamicSpecializationDoctors/>} /> 
      <Route path="/all-doctors" element={<AllDoctors/>} /> 
      <Route path="/add-doctor" element={<AddDoctor/>} /> 
      <Route path='/doctor/:doctor_ID' element={<DoctorDetails/>} />
      <Route path="/onspot-registration" element={<Onspot/>} /> 
      <Route path="/appointments" element={<PatientHistory/>} /> 
      <Route path="/profile" element={<Profile/>} /> 
      <Route path="/logout" element={<Logout/>} /> 

    </Routes>
  ) 
}

const App = () => {
 
  return (
    <>
      <Routing/>
    </> 
  )
}

export default App