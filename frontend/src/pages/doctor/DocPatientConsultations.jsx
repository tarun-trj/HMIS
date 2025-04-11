import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DocPatientConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Mock data fetching function
  const fetchConsultationsByPatientId = async (patientId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, date: "2025-04-03", doctorName: "Dr. Smith", location: "Room 101", details: "Checkup" },
          { id: 2, date: "2025-04-05", doctorName: "Dr. Adams", location: "Room 203", details: "Follow-up" }
        ]);
      }, 500);
    });
  };

  useEffect(() => {
    const loadConsultations = async () => {
      const data = await fetchConsultationsByPatientId(patientId);
      setConsultations(data);
    };
    loadConsultations();
  }, [patientId]);

  const handleDailyProgressClick = () => {
    navigate(`/patient-progress/${patientId}`);
  };

  const handleConsultationClick = (id) => {
    navigate(`/patient-consultations/${patientId}/consultation/${id}`);
  };

  const handleBackToAppointmentsClick = () => {
    navigate(`/doctor/appointments`);
  };

  return (
    <div className="p-6 bg-white">
      {/* Header with Daily Progress button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Consultations</h1>
        <button 
          className="px-4 py-2 bg-green-100 text-green-800 font-medium rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={handleDailyProgressClick}
        >
          Daily Progress
        </button>
      </div>
      {/* Main Content */}
      <div className="flex">
        <div className="flex-1">
          <div className="max-w-4xl">
            <div className="grid grid-cols-3 text-gray-700 font-medium mb-4">
              <div className="p-3">Date</div>
              <div className="p-3">Doctor Name</div>
              <div className="p-3">Location</div>
            </div>

            {consultations.map((consultation) => (
              <div 
                key={consultation.id} 
                className="grid grid-cols-3 mb-4 rounded-lg overflow-hidden bg-gray-800 text-white cursor-pointer"
                onClick={() => handleConsultationClick(consultation.id)}
              >
                <div className="p-4">{consultation.date}</div>
                <div className="p-4">{consultation.doctorName}</div>
                <div className="p-4">{consultation.location}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Back to Appointments Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleBackToAppointmentsClick}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Appointments
        </button>
      </div>
    </div>
  );
};

export default DocPatientConsultations;
