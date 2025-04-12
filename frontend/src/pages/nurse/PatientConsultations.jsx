import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PatientConsultations = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status colors for visual indication
  const statusColors = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  // Fetch patient details
  const fetchPatientDetails = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/patients/${patientId}`);
      // const data = await response.json();
      
      // Mock data for now
      const patientData = {
        id: parseInt(patientId),
        name: ["John Doe", "Jane Smith", "Robert Johnson", "Emily Williams"][parseInt(patientId) - 1],
        contact: ["555-123-4567", "555-987-6543", "555-456-7890", "555-789-0123"][parseInt(patientId) - 1]
      };
      
      setPatient(patientData);
    } catch (error) {
      console.error("Failed to fetch patient details:", error);
      setError("Failed to load patient information");
    }
  };

  // Fetch consultations for this patient
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/consultations?patient_id=${patientId}`);
      // const data = await response.json();
      
      // Mock data based on the schema from the image
      const mockConsultations = [
        {
          consult_id: 101,
          patient_id: parseInt(patientId),
          doctor_id: 3,
          doctor_name: "Dr. Sarah Johnson", // Additional field for display
          booked_date_time: "2025-03-28T10:30:00",
          status: "completed",
          reason: "Annual checkup",
          created_by: 2,
          created_at: "2025-03-20T08:15:00",
          actual_start_datetime: "2025-03-28T10:35:00",
          remark: "Patient is in good health",
          diagnosis: "Healthy, no concerns",
          bill_id: 1001,
          prescription: true,
          reports: false,
          recordedAt: "2025-03-28"
        },
        {
          consult_id: 102,
          patient_id: parseInt(patientId),
          doctor_id: 5,
          doctor_name: "Dr. Michael Chen", // Additional field for display
          booked_date_time: "2025-04-15T14:00:00",
          status: "scheduled",
          reason: "Follow-up on medication",
          created_by: 2,
          created_at: "2025-04-01T11:20:00",
          actual_start_datetime: null,
          remark: "",
          diagnosis: "",
          bill_id: null,
          prescription: false,
          reports: false,
          recordedAt: null
        },
        {
          consult_id: 103,
          patient_id: parseInt(patientId),
          doctor_id: 3,
          doctor_name: "Dr. Sarah Johnson", // Additional field for display
          booked_date_time: "2025-02-10T09:15:00",
          status: "cancelled",
          reason: "Flu symptoms",
          created_by: 2,
          created_at: "2025-02-08T16:45:00",
          actual_start_datetime: null,
          remark: "Patient called to cancel",
          diagnosis: "",
          bill_id: null,
          prescription: false,
          reports: false,
          recordedAt: "2025-02-08"
        }
      ];
      
      setConsultations(mockConsultations);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch consultations:", error);
      setError("Failed to load consultations");
      setLoading(false);
    }
  };

  // View consultation details function
  const viewConsultationDetails = (consultId) => {
    // Navigate to the shared consultation view component
    navigate(`/nurse/patient-consultations/${consultId}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/nurse/patient-records');
  };
  const handleDailyProgressClick = () => {
    navigate(`/nurse/patient-progress/${patientId}`);
  };

  useEffect(() => {
    fetchPatientDetails();
    fetchConsultations();
  }, [patientId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={handleBackClick}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleBackClick}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <span>← Back to Patients</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">
            Patient Consultations
          </h1>
          <button 
            onClick={handleDailyProgressClick}
            className="px-4 py-2 bg-green-100 text-green-800 font-medium rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <span>Daily Progress</span>
          </button>
          <div className="w-24"></div> {/* Empty div for flex spacing */}
        </div>
        
        {/* Patient Info Card */}
        {patient && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Patient ID</p>
                <p className="font-medium">P{patient.id.toString().padStart(3, '0')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{patient.contact}</p>
              </div>
            </div>
          </div>
        )}

        {/* Consultations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Consultation History
            </h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">Loading consultations...</p>
            </div>
          ) : consultations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No consultations found for this patient.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consult ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultations.map((consultation) => (
                    <tr key={consultation.consult_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          C{consultation.consult_id.toString().padStart(3, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">
                          {consultation.doctor_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">
                          {formatDate(consultation.booked_date_time)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[consultation.status]}`}>
                          {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">
                          {consultation.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => viewConsultationDetails(consultation.consult_id)}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1 rounded transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientConsultations;