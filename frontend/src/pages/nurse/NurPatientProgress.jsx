// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const NurPatientProgress = () => {
//   const navigate = useNavigate();
//   const progressData = [
//     { id: 1, date: "2025-04-10", details: "Vitals recorded: Temp 98°F, Heart Rate 72 bpm" },
//     { id: 2, date: "2025-04-11", details: "Vitals recorded: Temp 99°F, Heart Rate 74 bpm" },
//     { id: 3, date: "2025-04-12", details: "Vitals recorded: Temp 97°F, Heart Rate 70 bpm" },
//   ];

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h2 className="text-xl font-bold mb-6">Daily Progress</h2>
//       <table className="w-full border-collapse border border-gray-300 mb-6">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border border-gray-300 px-4 py-2">Date</th>
//             <th className="border border-gray-300 px-4 py-2">Details</th>
//             <th className="border border-gray-300 px-4 py-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {progressData.map((entry) => (
//             <tr key={entry.id} className="hover:bg-gray-100">
//               <td className="border border-gray-300 px-4 py-2">{entry.date}</td>
//               <td className="border border-gray-300 px-4 py-2">{entry.details}</td>
//               <td className="border border-gray-300 px-4 py-2">
//                 <button
//                   className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
//                   onClick={() => navigate(`/nurse/daily-progress/details/${entry.id}`)}
//                 >
//                   Details
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <button
//         className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//         onClick={() => navigate(`/nurse/daily-progress/add-vitals`)}
//         >
//         Add Vitals
//         </button>
//     </div>
//   );
// };

// export default NurPatientProgress;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const NurPatientProgress = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatientVitals = async () => {
      setLoading(true);
      try {
        // Fetch patient details first
        const patientResponse = await fetch(`http://localhost:5000/api/patients/profile/${patientId}`);
        if (!patientResponse.ok) {
          throw new Error('Failed to fetch patient details');
        }
        const patientData = await patientResponse.json();
        setPatient(patientData);

        // Then fetch all vitals for this patient
        const vitalsResponse = await fetch(`http://localhost:5000/api/doctors/progress/${patientId}`);
        if (!vitalsResponse.ok) {
          throw new Error('Failed to fetch vitals data');
        }
        
        const data = await vitalsResponse.json();
        
        // Format the data for display
        const formattedData = data.data.map(item => ({
          id: item._id,
          date: item.date,
          time: item.time,
          details: `Temp ${item.bodyTemp}°F, BP ${item.bloodPressure}/80, HR ${item.pulseRate} bpm, BR ${item.breathingRate} rpm`
        }));
        
        setProgressData(formattedData);
      } catch (err) {
        console.error('Error fetching patient vitals:', err);
        setError(err.message || 'Failed to load patient progress data');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientVitals();
    }
  }, [patientId]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Daily Progress</h2>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300"
          onClick={() => navigate(`/nurse/patients`)}
        >
          Back to Patients
        </button>
      </div>

      {patient && (
        <div className="mb-6 p-4 bg-green-50 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800">
            Patient: {patient.name}
          </h3>
          <p className="text-sm text-gray-600">
            ID: {patient._id}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      ) : progressData.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
          No vitals data available for this patient.
        </div>
      ) : (
        <table className="w-full border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Time</th>
              <th className="border border-gray-300 px-4 py-2">Details</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{entry.date}</td>
                <td className="border border-gray-300 px-4 py-2">{entry.time}</td>
                <td className="border border-gray-300 px-4 py-2">{entry.details}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
                    onClick={() => navigate(`/nurse/daily-progress/details/${patientId}/${entry.id}`)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex space-x-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => navigate(`/nurse/daily-progress/add-vitals/${patientId}`)}
        >
          Add Vitals
        </button>
      </div>
    </div>
  );
};

export default NurPatientProgress;