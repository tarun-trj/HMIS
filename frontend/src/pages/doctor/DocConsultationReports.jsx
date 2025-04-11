import React, { useState, useEffect } from "react";

const DocConsultationReports = ({ consultationId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data fetching function
  const fetchReportsByConsultationId = async (consultationId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            title: "Blood Test",
            date: "2025-04-03",
            content: "All levels within normal range. Hemoglobin: 14.2 g/dL",
            status: "completed"
          },
          {
            id: 2,
            title: "X-Ray",
            date: "2025-04-03",
            content: "Chest X-ray shows clear lungs, no abnormalities detected",
            status: "completed"
          }
        ]);
      }, 500);
    });
  };

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const data = await fetchReportsByConsultationId(consultationId);
        setReports(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading reports:", error);
        setLoading(false);
      }
    };

    loadReports();
  }, [consultationId]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reports</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border rounded p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{report.title}</h3>
                <span className="text-sm text-gray-500">{report.date}</span>
              </div>
              <p className="text-gray-700">{report.content}</p>
              <div className="mt-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  report.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">No reports available</p>
      )}
    </div>
  );
};

export default DocConsultationReports;
