import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import "../../styles/patient/RescheduleConsultation.css";

const RescheduleConsultation = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [tempDate, setTempDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const availableSlots = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
  ];

  const handleApply = () => {
    setSelectedDate(tempDate);
  };

  const handleClear = () => {
    setTempDate(new Date());
    setSelectedSlot("");
  };

  const handleReschedule = () => {
    if (!selectedSlot) {
      setShowModal(true);
      return;
    }
    setShowModal(true);
  };

  const updateConsultationInDB = async (date, slot) => {
    console.log(`Updating consultation in MongoDB: Date - ${date}, Slot - ${slot}`);
    // Placeholder for actual MongoDB update logic
  };

  const confirmReschedule = async () => {
    await updateConsultationInDB(selectedDate.toDateString(), selectedSlot);
    setShowModal(false);
    navigate("/patient/booked-consultation");
  };

  return (
    <div className="reschedule-container">
      <h2 className="reschedule-title">Reschedule Consultation</h2>

      <div className="reschedule-calendar">
        <h3 className="reschedule-label">Select a new date:</h3>
        <DatePicker
          selected={tempDate}
          onChange={(date) => setTempDate(date)}
          inline
          calendarClassName="custom-calendar"
        />
        <div className="calendar-buttons" style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
          <button className="apply-button" onClick={handleApply}>Apply</button>
          <button className="clear-button" onClick={handleClear}>Clear</button>
        </div>
      </div>

      <div className="reschedule-slot">
        <h3 className="reschedule-label">Choose a new slot:</h3>
        <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)} className="reschedule-dropdown">
          <option value="">Select a time slot</option>
          {availableSlots.map((slot, index) => (
            <option key={index} value={slot}>{slot}</option>
          ))}
        </select>
      </div>

      <button onClick={handleReschedule} className="reschedule-button">Reschedule Consultation</button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Reschedule</h3>
            <p>
              {selectedSlot
                ? `Are you sure you want to reschedule to ${selectedDate.toDateString()} at ${selectedSlot}?`
                : "Please select a time slot before rescheduling."}
            </p>
            <div className="modal-actions" style={{ display: "flex", justifyContent: selectedSlot ? "space-between" : "center" }}>
              <button className="cancel-modal-btn" onClick={() => setShowModal(false)}>Cancel</button>
              {selectedSlot && <button className="confirm-modal-btn" onClick={confirmReschedule}>Confirm</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescheduleConsultation;