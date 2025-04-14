import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';
import { Search } from 'lucide-react';

async function fetchConsultations(doctorId = null) {
  try {
    const response = await axios.get('http://localhost:5000/api/common/calendar/doctor', {
      params: {
        doctorId,
        startDate: moment().startOf('month').toISOString(),
        endDate: moment().endOf('month').toISOString()
      }
    });
    
    return response.data.map(event => ({
      id: event.id,
      title: event.title, // "Consultation with [patient name]"
      start: new Date(event.start),
      end: new Date(event.end),
      status: event.status,
      reason: event.reason,
      patientId: event.patientId,
      patientPhone: event.patientPhone,
      patientEmail: event.patientEmail
    }));
  } catch (error) {
    console.error("Error fetching consultations:", error);
    return [];
  }
}

const localizer = momentLocalizer(moment);

// Add custom formats
const formats = {
  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'dddd MMM D',
  dayRangeHeaderFormat: ({ start, end }) =>
    `${moment(start).format('MMM D')} - ${moment(end).format('MMM D, YYYY')}`,
  agendaHeaderFormat: ({ start, end }) =>
    `${moment(start).format('MMM D')} - ${moment(end).format('MMM D, YYYY')}`,
};

const MyCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_type: 'regular',
    reason: '',
    booked_date_time: moment().format('YYYY-MM-DDTHH:mm'),
  });

  // Fetch events based on role and selected doctor
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const doctorId = user?.role === 'doctor' ? user._id : selectedDoctor;
      if (doctorId) {
        const events = await fetchConsultations(doctorId);
        setEvents(events);
      } else {
        setEvents([]);
      }
      setLoading(false);
    };
    loadEvents();
  }, [user, selectedDoctor]);

  const handleSaveEvent = async () => {
    try {
      // Add validation
      if (!formData.doctor_id || !formData.patient_id || !formData.reason) {
        setErrorMessage('Doctor ID, Patient ID and Reason are required fields');
        return;
      }

      const consultationData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        booked_date_time: formData.booked_date_time,
        reason: formData.reason,
        created_by: Number(user._id),
        appointment_type: formData.appointment_type
      };

      await axios.post('http://localhost:5000/api/consultations/book', consultationData);

      setShowPrompt(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        appointment_type: 'regular',
        reason: '',
        booked_date_time: moment().format('YYYY-MM-DDTHH:mm')
      });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error creating appointment');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>
          <p className="text-gray-600">Manage appointments and consultations</p>
        </div>
        {/* Only show Add Appointment button for receptionists */}
        {user?.role === 'receptionist' && (
          <button
            onClick={() => setShowPrompt(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Add Appointment
          </button>
        )}
      </div>

      {/* Allow doctor search only for admin and receptionist */}
      {['admin', 'receptionist'].includes(user?.role) && (
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex items-center gap-2">
            <Search className="text-gray-400" size={20} />
            <input
              type="number"
              placeholder="Enter Doctor ID"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Calendar view - read only for doctors and admin */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            className="h-[600px] rbc-calendar-custom"
            style={{ margin: '1rem' }}
            views={['month', 'week', 'day']}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            selectable={user?.role === 'receptionist'} // Only receptionist can select dates
            onSelectSlot={user?.role === 'receptionist' ? () => setShowPrompt(true) : undefined}
            formats={formats}
            defaultDate={new Date()}
            eventPropGetter={() => ({
              className: 'bg-emerald-600 text-white rounded px-2 py-1'
            })}
            dayPropGetter={date => ({
              className: 'rbc-day-slot',
              style: {
                backgroundColor: moment(date).isSame(new Date(), 'day') ? '#f3f4f6' : 'transparent',
              }
            })}
          />
        </div>
      )}

      {/* Modal only for receptionist */}
      {showPrompt && user?.role === 'receptionist' && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-40"
            onClick={() => setShowPrompt(false)}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">New Appointment</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Doctor ID"
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                    className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Patient ID"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                    className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    required
                    min="1"
                  />
                </div>

                <select
                  value={formData.appointment_type}
                  onChange={(e) => setFormData({...formData, appointment_type: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="regular">Regular</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="consultation">Consultation</option>
                </select>

                <textarea
                  placeholder="Reason*"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                  required
                />

                <input
                  type="datetime-local"
                  value={formData.booked_date_time}
                  onChange={(e) => setFormData({...formData, booked_date_time: e.target.value})}
                  className="w-full p-2 border rounded"
                />

                {errorMessage && (
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Add these styles at the top of your file
const styles = `
  .rbc-calendar-custom {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont;
  }
  .rbc-calendar-custom .rbc-header {
    padding: 8px;
    font-weight: 500;
    font-size: 0.875rem;
  }
  .rbc-calendar-custom .rbc-date-cell {
    padding: 4px;
    font-size: 0.875rem;
  }
  .rbc-calendar-custom .rbc-month-view {
    border-radius: 0.5rem;
  }
  .rbc-calendar-custom .rbc-month-row {
    min-height: 100px;
  }
  .rbc-calendar-custom .rbc-today {
    background-color: #f3f4f6;
  }
`;

// Add style tag to document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

export default MyCalendar;
