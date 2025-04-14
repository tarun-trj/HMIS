import React, { useState } from 'react';
import axios from 'axios';

const AddReport = () => {
  const [patientId, setPatientId] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [availableTests, setAvailableTests] = useState([]);
  const [consultationId, setConsultationId] = useState(null);

  const searchPatient = async () => {
    if (!patientId) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/pathologists/searchById`, {
        params: {
          searchById: patientId
        }
      });
      const data = response.data;
      console.log(data);
      setPatientData(data.patient);
      setConsultationId(data.lastConsultation?._id);
      // Filter only pending tests
      const pendingTests = data.tests.filter(test => test.status === 'pending');
      setAvailableTests(pendingTests);
      if (pendingTests.length === 0) {
        setError('No pending tests found for this patient');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setPatientData(null);
      setAvailableTests([]);
      setConsultationId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedTest || !patientId || !consultationId) {
      console.log(selectedFile, selectedTest, patientId, consultationId);
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('testResultFile', selectedFile);
      formData.append('patientId', patientId);
      formData.append('testId', selectedTest);
      formData.append('consultationId', consultationId);

      const response = await axios.post('http://localhost:5000/api/pathologists/uploadTestResults',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Test results uploaded successfully!');

      // Reset form
      setSelectedTest('');
      setSelectedFile(null);
      setFileName('');
      // Refresh available tests
      searchPatient();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="p-8 bg-white h-full">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        {/* Patient ID Input */}
        <div className="mb-8 flex items-center justify-between">
          <label htmlFor="patientId" className="text-gray-800 font-medium mr-4">
            Patient ID:
          </label>
          <div className="flex flex-1">
            <input
              type="text"
              id="patientId"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full py-2 px-3 bg-gray-200 rounded-l-md text-gray-700"
            />
            <button
              type="button"
              onClick={searchPatient}
              disabled={loading || !patientId}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-r-md transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'ENTER'}
            </button>
          </div>
        </div>

        {/* Patient Info */}
        {patientData && (
          <div className="mb-8 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Patient Information</h3>
            <p>Name: {patientData.name}</p>
            <p>Age: {patientData.patient_info.age}</p>
            <p>Blood Group: {patientData.patient_info.bloodGrp}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {/* Test Selection Dropdown */}
        <div className="mb-8 flex items-center justify-between">
          <label htmlFor="testSelect" className="text-gray-800 font-medium mr-4">
            Select Test
          </label>
          <select
            id="testSelect"
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="flex-1 py-2 px-3 bg-gray-200 rounded-md text-gray-700 appearance-none"
            disabled={!patientData || availableTests.length === 0}
          >
            <option key={0} value="">Select a test...</option>
            {availableTests.map((test) => (
              <option key={test._id} value={test._id}>
                {test.title}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div className="flex justify-center mt-16">
          <div className="flex space-x-4">
            <label className={`${!patientData || !selectedTest ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 cursor-pointer'} text-white px-4 py-2 rounded transition-colors`}>
              Choose File
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                disabled={!patientData || !selectedTest}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>
            <button
              type="submit"
              disabled={!selectedFile || !selectedTest || !patientData || loading}
              className={`${!selectedFile || !selectedTest || !patientData || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 cursor-pointer'} text-white px-4 py-2 rounded transition-colors`}
            >
              {loading ? 'Uploading...' : 'Upload Report'}
            </button>
          </div>
        </div>

        {/* Display selected filename */}
        {fileName && (
          <div className="mt-4 text-center text-gray-700">
            Selected file: {fileName}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddReport;