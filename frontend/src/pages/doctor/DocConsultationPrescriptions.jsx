import React, { useState, useEffect } from "react";

const DocConsultationPrescriptions = ({ consultationId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editPrescription, setEditPrescription] = useState({ medicine: "", dosage: "", frequency: "" });

  // Mock data fetching function
  const fetchPrescriptionsByConsultationId = async (consultationId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            medicine: "Paracetamol",
            dosage: "500mg",
            frequency: "Every 6 hours",
            duration: "5 days",
            notes: "Take after meals"
          },
          {
            id: 2,
            medicine: "Vitamin C",
            dosage: "1000mg",
            frequency: "Once daily",
            duration: "30 days",
            notes: "Take with water"
          }
        ]);
      }, 500);
    });
  };

  useEffect(() => {
    const loadPrescriptions = async () => {
      setLoading(true);
      try {
        const data = await fetchPrescriptionsByConsultationId(consultationId);
        setPrescriptions(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading prescriptions:", error);
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, [consultationId]);

  const handleEdit = () => {
    setEditing(true);
    // Set default values for editing
    if (prescriptions.length > 0) {
      setEditPrescription({
        medicine: "PCM",
        dosage: "100mg",
        frequency: "every day"
      });
    }
  };

  const handleSave = () => {
    setEditing(false);
    // In a real app, you would send the updated prescription to the server
    console.log("Saving prescription:", editPrescription);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Prescriptions</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading prescriptions...</p>
        </div>
      ) : editing ? (
        <div className="border rounded p-4 bg-gray-50">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Medicine</label>
            <input 
              type="text" 
              value={editPrescription.medicine}
              onChange={(e) => setEditPrescription({...editPrescription, medicine: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Dosage</label>
            <input 
              type="text" 
              value={editPrescription.dosage}
              onChange={(e) => setEditPrescription({...editPrescription, dosage: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Frequency</label>
            <input 
              type="text" 
              value={editPrescription.frequency}
              onChange={(e) => setEditPrescription({...editPrescription, frequency: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="text-right">
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-end mb-2">
            <button 
              onClick={handleEdit}
              className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm"
            >
              Edit
            </button>
          </div>
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="border rounded p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Medicine</p>
                  <p className="font-medium">{prescription.medicine}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Dosage</p>
                  <p className="font-medium">{prescription.dosage}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Frequency</p>
                  <p className="font-medium">{prescription.frequency}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Duration</p>
                  <p className="font-medium">{prescription.duration}</p>
                </div>
              </div>
              {prescription.notes && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-gray-500 text-sm">Notes</p>
                  <p>{prescription.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-4">
          <p className="text-gray-500 mb-4">No prescriptions available</p>
          <button 
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Prescription
          </button>
        </div>
      )}
    </div>
  );
};

export default DocConsultationPrescriptions;
