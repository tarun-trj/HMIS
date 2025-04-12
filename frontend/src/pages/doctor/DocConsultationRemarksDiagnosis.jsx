import React, { useState, useEffect } from "react";

const DocConsultationRemarksDiagnosis = ({ consultationId }) => {
  const [remarksDiagnosis, setRemarksDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingDiagnosis, setEditingDiagnosis] = useState(false);
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [diagnosisText, setDiagnosisText] = useState("");
  const [remarksText, setRemarksText] = useState("");

  // Mock data fetching function
  const fetchRemarksDiagnosisByConsultationId = async (consultationId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          diagnosis: "Mild Flu, with slight dehydration",
          remarks: "Patient reported symptoms starting 3 days ago. Advised rest and fluids."
        });
      }, 500);
    });
  };

  useEffect(() => {
    const loadRemarksDiagnosis = async () => {
      setLoading(true);
      try {
        const data = await fetchRemarksDiagnosisByConsultationId(consultationId);
        setRemarksDiagnosis(data);
        setDiagnosisText(data.diagnosis || "");
        setRemarksText(data.remarks || "");
        setLoading(false);
      } catch (error) {
        console.error("Error loading remarks/diagnosis:", error);
        setLoading(false);
      }
    };

    loadRemarksDiagnosis();
  }, [consultationId]);

  const handleSaveDiagnosis = () => {
    setEditingDiagnosis(false);
    setRemarksDiagnosis(prev => ({
      ...prev,
      diagnosis: diagnosisText
    }));
    // In a real app, you would send this update to the server
    console.log("Saving diagnosis:", diagnosisText);
  };

  const handleSaveRemarks = () => {
    setEditingRemarks(false);
    setRemarksDiagnosis(prev => ({
      ...prev,
      remarks: remarksText
    }));
    // In a real app, you would send this update to the server
    console.log("Saving remarks:", remarksText);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Remarks & Diagnosis</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      ) : remarksDiagnosis ? (
        <div className="space-y-6">
          {/* Diagnosis Section */}
          <div className="border rounded p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Diagnosis</h3>
              {!editingDiagnosis && (
                <button 
                  onClick={() => setEditingDiagnosis(true)}
                  className="text-sm px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  Edit
                </button>
              )}
            </div>
            
            {editingDiagnosis ? (
              <div>
                <textarea
                  value={diagnosisText}
                  onChange={(e) => setDiagnosisText(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  rows={3}
                />
                <div className="text-right">
                  <button 
                    onClick={handleSaveDiagnosis}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">{remarksDiagnosis.diagnosis || "No diagnosis recorded"}</p>
            )}
          </div>
          
          {/* Remarks Section */}
          <div className="border rounded p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Remarks</h3>
              {!editingRemarks && (
                <button 
                  onClick={() => setEditingRemarks(true)}
                  className="text-sm px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  Edit
                </button>
              )}
            </div>
            
            {editingRemarks ? (
              <div>
                <textarea
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  rows={3}
                />
                <div className="text-right">
                  <button 
                    onClick={handleSaveRemarks}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">{remarksDiagnosis.remarks || "No remarks recorded"}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">No data available</p>
      )}
    </div>
  );
};

export default DocConsultationRemarksDiagnosis;
