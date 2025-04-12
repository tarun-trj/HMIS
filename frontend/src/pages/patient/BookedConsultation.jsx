import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import "../../styles/patient/BookedConsultations.css";

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
          return consultDate < now;
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


export const deleteConsultationById = async (consultationId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/patients/${consultationId}/cancel`, {
      method: "DELETE",
    });

    const data = await res.json();

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
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelConsultationId, setCancelConsultationId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const navigate = useNavigate();
  const patientId = "10013";

  useEffect(() => {
    const loadConsultations = async () => {
      const data = await fetchConsultationsByPatientId(patientId);
      setConsultations(data);
    };

    loadConsultations();
  }, [patientId]);

  const handleCancel = (consultationId) => {
    setCancelConsultationId(consultationId);
    setShowCancelModal(true);
  };

  const confirmReschedule = () => {
    if (selectedConsultation) {
      
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
  ;

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
                <button className="cancel-btn" onClick={() => handleCancel(consult.id)}>Cancel</button>
                <button className="reschedule-btn" onClick={() => handleReschedule(consult)}>Reschedule</button>
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
