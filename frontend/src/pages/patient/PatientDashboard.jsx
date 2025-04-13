import React, { useState, useEffect } from "react";
import { Pencil, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/patient/PatientDashboard.css";
import axios from 'axios';

const calculateAge = dob => new Date().getFullYear() - new Date(dob).getFullYear() - (new Date() < new Date(new Date(dob).setFullYear(new Date().getFullYear())) ? 1 : 0);

const PatientDashboard = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const navigate = useNavigate();
  const patientId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/profile/${patientId}`);
        setPatientData(response.data);
        setProfilePhoto(response.data.profile_pic);
      } catch (error) {
        console.error('Failed to fetch patient data:', error);
      }
    };

    const fetchConsultations = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/${patientId}/consultations`);
        const consultations = response.data.consultations;
         // Get today's date for filtering
        const today = new Date();

        // Filter upcoming consultations
        const upcomingConsultations = consultations.filter(consultation => new Date(consultation.booked_date_time) >= today);

        // If there are no upcoming consultations, get the 3 most recent ones
        let consultationsToDisplay = [];
        if (upcomingConsultations.length > 0) {
          consultationsToDisplay = upcomingConsultations.sort((a, b) => new Date(a.booked_date_time) - new Date(b.booked_date_time)); // Sort upcoming by booked date
        } else {
          // Sort by booked_date_time in descending order and take the most recent 3 consultations
          consultationsToDisplay = consultations.sort((a, b) => new Date(b.booked_date_time) - new Date(a.booked_date_time)).slice(0, 3);
        }

        setAppointments(consultationsToDisplay);
      } catch (error) {
        console.error('Failed to fetch consultations data:', error);
      }
    }

    fetchPatientData();
    fetchConsultations();
  }, []);


  if (!patientData) {
    return <div className="text-center p-8">Loading...</div>;
  }

  const patient_info = patientData.patient_info;

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
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <p className="font-bold">{appointment.doctorName}</p>
                <p className="text-gray-600">{appointment.time}</p>
                <p className={`appointment-status ${appointment.status === "Completed" ? "status-completed" : "status-scheduled"}`}>
                  {appointment.status}
                </p>
              </div>
            ))
          ) : (
            <p>No appointments</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;