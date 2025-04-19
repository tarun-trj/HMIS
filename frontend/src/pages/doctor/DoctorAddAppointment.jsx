import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { Calendar, Clock, User, Users, MapPin, FileText } from 'lucide-react';

const DoctorAddAppointment = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    roomNo: '',
    appointmentType: 'regular',
    notes: '',
  });

  const { axiosInstance } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    const fetchDoctorId = async () => {
      try {
        const employeeId = localStorage.getItem('user_id');
        
        if (employeeId) {
          // Fetch the doctor_id using the employee_id from the API
          const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/employees/doctor-id/${employeeId}`);
          
          if (response.data && response.data.doctor_id) {
            setFormData(prev => ({
              ...prev,
              doctorId: response.data.doctor_id
            }));
          } else {
            console.error('Doctor ID not found in response:', response.data);
            setMessage({
              type: 'error',
              text: 'Could not retrieve doctor information. Please contact system administrator.'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching doctor ID:', error);
        setMessage({
          type: 'error',
          text: 'Failed to fetch doctor information. Please try again or contact IT support.'
        });
      }
    };

    fetchDoctorId();
  }, [axiosInstance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Create the consultation request only
      const consultationData = {
        patient_id: formData.patientId,
        doctor_id: formData.doctorId,
        booked_date_time: `${formData.date}T${formData.time}`,
        reason: formData.notes,
        appointment_type: formData.appointmentType.toLowerCase(),
        created_by: 10126, // ID for appointments created by doctors
        status: 'requested'
      };

      // Post the consultation request to be reviewed by receptionist
      await axiosInstance.post(`${import.meta.env.VITE_API_URL}/consultations/book`, consultationData);

      setMessage({
        type: 'success',
        text: 'Appointment request sent successfully! The receptionist will review it shortly.'
      });
      
      // Reset form but keep doctor ID
      setFormData({
        patientId: '',
        doctorId: formData.doctorId, // Keep doctor information
        date: '',
        time: '',
        roomNo: '',
        appointmentType: 'regular',
        notes: '',
      });
    } catch (error) {
      console.error('Error submitting appointment request:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit appointment request. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Request New Appointment
      </h2>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
              <User size={18} className="mr-2" />
              Patient Information
            </h3>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Patient ID:
              </label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          {/* Doctor Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
              <Users size={18} className="mr-2" />
              Doctor Information
            </h3>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Doctor ID:
              </label>
              <input
                type="text"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
            <Calendar size={18} className="mr-2" />
            Appointment Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Date:
              </label>
              <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-teal-500">
                <Calendar size={16} className="ml-3 text-gray-500" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 focus:outline-none border-none"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Time:
              </label>
              <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-teal-500">
                <Clock size={16} className="ml-3 text-gray-500" />
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 focus:outline-none border-none"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Room No:
              </label>
              <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-teal-500">
                <MapPin size={16} className="ml-3 text-gray-500" />
                <input
                  type="text"
                  name="roomNo"
                  value={formData.roomNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 focus:outline-none border-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Appointment Type:
            </label>
            <select
              name="appointmentType"
              value={formData.appointmentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="regular">Regular</option>
              <option value="emergency">Emergency</option>
              <option value="follow-up">Follow-up</option>
              <option value="consultation">Consultation</option>
            </select>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
            <FileText size={18} className="mr-2" />
            Appointment Notes
          </h3>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows="4"
            placeholder="Add appointment details, reason, or special instructions here..."
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorAddAppointment;