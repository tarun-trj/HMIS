import React, { useState, useEffect,useRef } from "react";
import { Pencil, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/patient/PatientDashboard.css";
import axios from 'axios';
import { useAuth } from "../../context/AuthContext";


const calculateAge = dob => new Date().getFullYear() - new Date(dob).getFullYear() - (new Date() < new Date(new Date(dob).setFullYear(new Date().getFullYear())) ? 1 : 0);

export const fetchConsultationsByPatientId = async (patientId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/patients/${patientId}/consultations`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error("Failed to fetch consultations");
    }

    // Check if we received dummy data or actual consultations
    if (data.dummy) {
      return data.consultations; // Return the dummy data as is
    }

    // Handle actual data
    // Get current date to compare
    const now = new Date();

    // Filter only past consultations
    const pastConsultations = Array.isArray(data) 
      ? data.filter((c) => {
          const consultDate = new Date(c.booked_date_time);
          return consultDate > now;
        })
      : [];

    // Transform the data to match the component's expected format
    const formattedConsultations = pastConsultations.map(consult => ({
      id: consult._id,
      date: new Date(consult.booked_date_time).toLocaleString(),
      doctor: consult.doctor.name,
      location: consult.appointment_type,
      doctorId: consult.doctor_id,
      status: consult.status,
      reason: consult.reason,
      // Add any other properties your component needs
    }));
      
    console.log(formattedConsultations);
    return formattedConsultations;
  } catch (err) {
    console.error("Error fetching consultations:", err);
    return []; // fallback return
  }
};



const PatientDashboard = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const {setUser } = useAuth();

  const patientId = localStorage.getItem("user_id");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profile_pic", file);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/patients/upload-photo/${patientId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const newProfilePicUrl = res.data.profile_pic;      // Assuming the server returns the new photo URL
      setProfilePhoto(newProfilePicUrl);
      setUser((prev) => ({
        ...prev,
        profile_pic: newProfilePicUrl,
      }));

    } catch (err) {
      console.error("Upload failed", err);
    }
  };

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

    fetchPatientData();

    const loadConsultations = async () => {
      const data = await fetchConsultationsByPatientId(patientId);
      setAppointments(data);
    };

    loadConsultations();
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
            <button
              className="edit-button absolute bottom-1 right-1"
              onClick={() => fileInputRef.current.click()}
            >
              <Pencil />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

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
          {appointments ? (
            appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card cursor-pointer" onClick={() => navigate(`/patient/previous-consultations/${appointment.id}`)}>
                <p className="font-bold">Dr {appointment.doctor}</p>
                <p className="text-gray-600">Date: {appointment.date.replace(',', ' Time: ')}</p>
                <p className={`appointment-status ${appointment.status === "Completed" ? "status-completed" : "status-scheduled"}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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