import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const NurAddVitals = () => {
  const { id } = useParams(); // Get the progress ID from the route parameters
  const [vitals, setVitals] = useState({
    bodyTemp: '',
    heartRate: '',
    breathingRate: '',
    bloodPressure: '',
  });

  const handleChange = (e) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mock saving data (typically involves an API call)
    console.log(`Vitals added for progress ID ${id}:`, vitals);

    // Reset form fields after submission
    setVitals({
      bodyTemp: '',
      heartRate: '',
      breathingRate: '',
      bloodPressure: '',
    });

    alert('Vitals added successfully!');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-bold mb-6">Add Vitals</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bodyTemp" className="block text-sm font-medium text-gray-700">Body Temperature (°F)</label>
          <input
            type="text"
            name="bodyTemp"
            id="bodyTemp"
            value={vitals.bodyTemp}
            onChange={handleChange}
            className="mt-1 block w-full p-[10px] text-sm border rounded focus:ring focus:ring-green"
          />
        </div>

        <div>
          <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
          <input
            type="text"
            name="heartRate"
            id="heartRate"
            value={vitals.heartRate}
            onChange={handleChange}
            className="mt-1 block w-full p-[10px] text-sm border rounded focus:ring focus:ring-green"
          />
        </div>

        <div>
          <label htmlFor="breathingRate" className="block text-sm font-medium text-gray-700">Breathing Rate (rpm)</label>
          <input
            type="text"
            name="breathingRate"
            id="breathingRate"
            value={vitals.breathingRate}
            onChange={handleChange}
            className="mt-1 block w-full p-[10px] text-sm border rounded focus:ring focus:ring-green"
          />
        </div>

        <div>
          <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700">Blood Pressure (mmHg)</label>
          <input
            type="text"
            name="bloodPressure"
            id="bloodPressure"
            value={vitals.bloodPressure}
            onChange={handleChange}
            className="mt-1 block w-full p-[10px] text-sm border rounded focus:ring focus:ring-green"
          />
        </div>

        {/* Done Button */}
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mt-4"
        >
          Done
        </button>
      </form>
    </div>
  );
};

export default NurAddVitals;
