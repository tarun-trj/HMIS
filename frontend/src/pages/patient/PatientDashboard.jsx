import React, { useState, useEffect } from "react";
import { Pencil, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/patient/PatientDashboard.css";
import axios from 'axios';

const calculateAge = dob => new Date().getFullYear() - new Date(dob).getFullYear() - (new Date() < new Date(new Date(dob).setFullYear(new Date().getFullYear())) ? 1 : 0);

const PatientDashboard = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientId = localStorage.getItem("user_id");
        const response = await axios.get(`http://localhost:5000/api/patients/profile/${patientId}`);  
        setPatientData(response.data);
        setProfilePhoto(response.data.profile_pic);
      } catch (error) {
        console.error('Failed to fetch patient data:', error);
      }
    };

    fetchPatientData();
  }, []);


  if (!patientData) {
    return <div className="text-center p-8">Loading...</div>;
  }

  const patient_info = patientData.patient_info;
  const appointments = [];

  return (
    <div className="patient-dashboard">
      {/* Left Section: Profile + Basic Info */}
      <div className="profile-section">
        {/* Profile Photo */}
        <div className="profile-photo-container">
          <div className="profile-photo">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" />
            ) : (
              <span className="text-gray-600">Profile Photo</span>
            )}
            <button className="edit-button">
              <Pencil />
            </button>
          </div>
        </div>

        {/* Patient Info */}
        <div className="patient-info">
          <h1>{patient_info.name}</h1>

          <div className="patient-detail">
            <label>Age:</label>
            <span>{calculateAge(patientData.date_of_birth)}</span>
          </div>

          <div className="patient-detail">
            <label>Blood Group:</label>
            <span>{patient_info.bloodGrp}</span>
          </div>

          <div className="patient-detail">
            <label>Height:</label>
            <span>{patient_info.height} cm</span>
          </div>

          <div className="patient-detail">
            <label>Weight:</label>
            <span>{patient_info.weight} kg</span>
          </div>

          <div className="patient-detail">
            <label>Bed No:</label>
            <span>{patient_info.bedNo}</span>
          </div>

          <div className="patient-detail">
            <label>Room No:</label>
            <span>{patient_info.roomNo}</span>
          </div>
        </div>
      </div>

      {/* Right Section: Appointments */}
      <div className="appointments-section">
        <h2 className="appointments-heading" onClick={() => navigate("./consultations")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          Appointments <ArrowRight />
        </h2>
        <div>
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <p className="font-bold">{appointment.doctorName}</p>
              <p className="text-gray-600">{appointment.time}</p>
              <p className={`appointment-status ${appointment.status === "Completed" ? "status-completed" : "status-scheduled"}`}>
                {appointment.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;