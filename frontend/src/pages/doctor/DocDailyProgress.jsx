import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DocDailyProgress = () => {
  const [progressData, setProgressData] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Mock data fetching function
  const fetchDailyProgressByPatientId = async (patientId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { 
            id: 1, 
            date: "2025-04-03", 
            temperature: "98.6°F", 
            bloodPressure: "120/80", 
            pulse: "72 bpm",
            respiration: "16/min",
            oxygenSaturation: "98%"
          },
          { 
            id: 2, 
            date: "2025-04-04", 
            temperature: "98.4°F", 
            bloodPressure: "118/78", 
            pulse: "70 bpm",
            respiration: "15/min",
            oxygenSaturation: "99%"
          },
          { 
            id: 3, 
            date: "2025-04-05", 
            temperature: "98.7°F", 
            bloodPressure: "122/82", 
            pulse: "74 bpm",
            respiration: "16/min",
            oxygenSaturation: "97%"
          }
        ]);
      }, 500);
    });
  };

  // Mock function to get patient details
  const fetchPatientDetails = async (patientId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: patientId,
          name: "Arpan Jain",
          age: 32,
          gender: "Male",
        });
      }, 300);
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [progressData, patientData] = await Promise.all([
          fetchDailyProgressByPatientId(patientId),
          fetchPatientDetails(patientId)
        ]);
        setProgressData(progressData);
        setPatient(patientData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const handleBackClick = () => {
    navigate(`/patient-consultations/${patientId}`);
  };

  return (
    <div className="p-6 bg-white">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Progress</h1>
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-green-100 text-green-800 font-medium rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Back
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading progress data...</p>
        </div>
      ) : (
        <>
          {/* Patient Information */}
          {patient && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Patient: {patient.name}
              </h2>
              <p className="text-sm text-gray-600">
                {patient.age} years, {patient.gender}
              </p>
            </div>
          )}

          {/* Progress Table */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Temperature</th>
                  <th className="px-4 py-3 text-left">Blood Pressure</th>
                  <th className="px-4 py-3 text-left">Pulse</th>
                  <th className="px-4 py-3 text-left">Respiration</th>
                  <th className="px-4 py-3 text-left">O₂ Saturation</th>
                </tr>
              </thead>
              <tbody>
                {progressData.map((progress) => (
                  <tr key={progress.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{progress.date}</td>
                    <td className="px-4 py-3">{progress.temperature}</td>
                    <td className="px-4 py-3">{progress.bloodPressure}</td>
                    <td className="px-4 py-3">{progress.pulse}</td>
                    <td className="px-4 py-3">{progress.respiration}</td>
                    <td className="px-4 py-3">{progress.oxygenSaturation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DocDailyProgress;
