import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const NurDailyProgressDetail = () => {
  const { progressId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [progressData, setProgressData] = useState({
    date: '2025-04-12',
    time: '10:30 AM',
    bodyTemp: '98.6°F',
    heartRate: '72 bpm',
    breathingRate: '16 rpm',
    bloodPressure: '120/80 mmHg'
  });
  
  const [editableData, setEditableData] = useState({...progressData});

  const handleEdit = () => {
    setIsEditing(true);
    setEditableData({...progressData});
  };

  const handleSave = () => {
    setProgressData({...editableData});
    setIsEditing(false);
    // Here you would typically save to a backend
    alert("Progress data saved successfully!");
  };

  const handleChange = (e) => {
    setEditableData({
      ...editableData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Daily Progress</h2>
        {/* Empty divs for top right icons as in design */}
        <div className="flex space-x-2">
          <div className="w-6 h-6 border border-gray-300"></div>
          <div className="w-6 h-6 border border-gray-300"></div>
        </div>
      </div>

      {/* Left sidebar navigation */}
      <div className="flex flex-row">
        <div className="w-1/5 pr-4">
          <div className="space-y-3">
            <button className="w-full bg-white text-center py-2 px-4 rounded shadow">Profile</button>
            <button className="w-full bg-white text-center py-2 px-4 rounded shadow">Consultations</button>
            <button className="w-full bg-white text-center py-2 px-4 rounded shadow">Bills</button>
            <button className="w-full bg-white text-center py-2 px-4 rounded shadow">Feedback</button>
            <button className="w-full bg-white text-center py-2 px-4 rounded shadow">Daily Progress</button>
          </div>
        </div>

        <div className="w-4/5 bg-white rounded shadow p-4">
          {/* Table header */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-gray-300 p-3 text-center">Date</div>
            <div className="bg-gray-300 p-3 text-center">Time</div>
            <div className="bg-gray-300 p-3 text-center">Details</div>
          </div>

          <h3 className="font-bold text-lg mb-4">Details</h3>

          {!isEditing ? (
            /* View Mode */
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-300 p-3">Body temp: {progressData.bodyTemp}</div>
                <div className="bg-white border border-gray-300 p-3"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-300 p-3">Heart Rate: {progressData.heartRate}</div>
                <div className="bg-white border border-gray-300 p-3"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-300 p-3">Breathing Rate: {progressData.breathingRate}</div>
                <div className="bg-white border border-gray-300 p-3"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-300 p-3">Blood pressure: {progressData.bloodPressure}</div>
                <div className="bg-white border border-gray-300 p-3"></div>
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  className="bg-gray-300 hover:bg-gray-400 text-black px-10 py-2 rounded"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-300 p-3">Body temp</div>
                <input 
                  type="text"
                  name="bodyTemp"
                  value={editableData.bodyTemp}
                  onChange={handleChange}
                  className="border border-gray-300 p-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-300 p-3">Heart Rate</div>
                <input 
                  type="text"
                  name="heartRate"
                  value={editableData.heartRate}
                  onChange={handleChange}
                  className="border border-gray-300 p-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-300 p-3">Breathing Rate</div>
                <input 
                  type="text"
                  name="breathingRate"
                  value={editableData.breathingRate}
                  onChange={handleChange}
                  className="border border-gray-300 p-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-300 p-3">Blood pressure</div>
                <input 
                  type="text"
                  name="bloodPressure"
                  value={editableData.bloodPressure}
                  onChange={handleChange}
                  className="border border-gray-300 p-3"
                />
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  className="bg-gray-300 hover:bg-gray-400 text-black px-10 py-2 rounded"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurDailyProgressDetail;
