import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import "../../styles/patient/BookedConsultations.css";
import { useAuth } from "../../context/AuthContext";


import axios from "axios";

export const fetchConsultationsByPatientId = async (patientId, axiosInstance) => {
  try {
    const res = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/patients/${patientId}/consultations`);
    const data = res.data;

    if (!data) {
      throw new Error("Failed to fetch consultations");
    }

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
    return [];
  }
};


export const deleteConsultationById = async (consultationId) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/patients/${consultationId}/cancel`, {
      method: "DELETE",
    });


    const data = await res.json();
    console.log(data)

    if (!res.ok) {
      throw new Error(data?.error || data?.message || "Failed to cancel consultation.");
    }

    return { success: true, message: data.message };
  } catch (err) {
    console.error("Error deleting consultation:", err);
    return { success: false, message: err.message || "Something went wrong" };
  }
};


const BookedConsultation = () => {
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [Loading, setLoading] = useState(true);
  const { axiosInstance } = useAuth();


  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelConsultationId, setCancelConsultationId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const navigate = useNavigate();
  const patientId = localStorage.getItem("user_id");

  useEffect(() => {
    const loadConsultations = async () => {
      const data = await fetchConsultationsByPatientId(patientId, axiosInstance);
      if (window._authFailed) return; // Skip updating state if auth failed
      setConsultations(data);
      setLoading(false);
    };

    loadConsultations();
  }, [patientId]);

  const handleCancel = (consultationId) => {
    setCancelConsultationId(consultationId);
    setShowCancelModal(true);
  };

  const confirmReschedule = () => {
    if (selectedConsultation) {
      console.log(selectedConsultation)
      navigate('/patient/reschedule-consultation/' + selectedConsultation.id)
      // Clear selection after navigation
      setSelectedConsultation(null);
    }
  };

  const handleReschedule = (consult) => {
    setSelectedConsultation(consult);
  };

  const confirmCancel = async () => {
    if (cancelConsultationId) {
      try {
        const result = await deleteConsultationById(cancelConsultationId);

        if (result.success) {
          setConsultations((prev) => prev.filter((c) => c.id !== cancelConsultationId));
          setShowCancelModal(false);
          setCancelConsultationId(null);
        } else {
          setShowCancelModal(false);
          setErrorMessage(result.message);
          setShowErrorModal(true);
        }
      } catch (error) {
        setShowCancelModal(false);
        setErrorMessage("Unexpected error while cancelling consultation.");
        setShowErrorModal(true);
      }
    }
  };
  if (Loading) return <div className="loading">Loading...</div>;


  return (
    <div className="consultations-page">
      <main className="consultations-content">
        <header className="consultations-header">
          <h2>Patient Consultations</h2>
          <Home className="home-icon" />
        </header>
        <section className="consultations-list">
          {consultations.length > 0 ? (
            consultations.map((consult) => (
              <div key={consult.id} className="consultation-card">
                <span className="consult-date">{consult.date}</span>
                <span className="consult-doctor">{consult.doctor}</span>
                <span className="consult-location">{consult.location}</span>
                <button
                  onClick={() => handleCancel(consult.id)}
                  disabled={consult.status === "cancelled"}
                  className={`px-4 py-2 rounded-md font-medium transition 
    ${consult.status === "cancelled"
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"}`}
                  title={consult.status === "cancelled" ? "Already cancelled" : "Cancel consultation"}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReschedule(consult)}
                  disabled={consult.status === "completed"}
                  className={`px-4 py-2 rounded-md font-medium transition
    ${consult.status === "completed"
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"}`}
                  title={consult.status === "completed" ? "Completed consultations cannot be rescheduled" : "Reschedule consultation"}
                >
                  Reschedule
                </button>

              </div>
            ))
          ) : (
            <p className="no-data">No Consultations Available</p>
          )}
        </section>
      </main>

      {/* Custom Modal for Reschedule Confirmation */}
      {selectedConsultation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Reschedule</h3>
            <p>
              Are you sure you want to reschedule your appointment with{" "}
              <strong>{selectedConsultation.doctor}</strong> on{" "}
              <strong>{selectedConsultation.date}</strong>?
            </p>
            <div className="modal-actions">
              <button className="cancel-modal-btn" onClick={() => setSelectedConsultation(null)}>
                No, Cancel
              </button>
              <button className="confirm-modal-btn" onClick={confirmReschedule}>
                Yes, Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Consultation</h3>
            <p>Are you sure you want to cancel this consultation?</p>
            <div className="modal-actions">
              <button className="cancel-modal-btn" onClick={() => setShowCancelModal(false)}>
                No, Keep It
              </button>
              <button className="confirm-modal-btn" onClick={confirmCancel}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <div className="modal-actions">
              <button className="confirm-modal-btn" onClick={() => setShowErrorModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookedConsultation;
