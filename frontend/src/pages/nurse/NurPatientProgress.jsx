import React from 'react';
import { useNavigate } from 'react-router-dom';

const NurPatientProgress = () => {
  const navigate = useNavigate();
  const progressData = [
    { id: 1, date: "2025-04-10", details: "Vitals recorded: Temp 98°F, Heart Rate 72 bpm" },
    { id: 2, date: "2025-04-11", details: "Vitals recorded: Temp 99°F, Heart Rate 74 bpm" },
    { id: 3, date: "2025-04-12", details: "Vitals recorded: Temp 97°F, Heart Rate 70 bpm" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-bold mb-6">Daily Progress</h2>
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Details</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {progressData.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{entry.date}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.details}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
                  onClick={() => navigate(`/nurse/daily-progress/details/${entry.id}`)}
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={() => navigate(`/nurse/daily-progress/add-vitals`)}
        >
        Add Vitals
        </button>
    </div>
  );
};

export default NurPatientProgress;
