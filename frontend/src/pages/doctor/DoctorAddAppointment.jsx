import React, { useState, useRef, useEffect } from 'react';

const DoctorAddAppointment = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    time: '',
    roomNo: '',
    date: '',
    patientName: '',
    doctorName: '',
    appointmentType: 'Regular',
    notes: '',
  });
  
  // States for voice recording functionality
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [recordingStatus, setRecordingStatus] = useState('');
  const [highlightedField, setHighlightedField] = useState(null);
  
  // States for AI processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Refs for recording and transcript
  const recognitionRef = useRef(null);
  const currentTranscriptRef = useRef('');
  
  // Backend API endpoint
  const BACKEND_API_URL = 'http://localhost:5000/api/gemini';
  
  // Animation for filled field
  useEffect(() => {
    if (highlightedField) {
      const timer = setTimeout(() => {
        setHighlightedField(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedField]);
  
  // Animation for success message
  useEffect(() => {
    if (showSuccessAnimation) {
      const timer = setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAnimation]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Appointment Data:', formData);
    // Clear form or show success message
    alert('Appointment booked successfully!');
    setFormData({
      patientId: '',
      doctorId: '',
      time: '',
      roomNo: '',
      date: '',
      patientName: '',
      doctorName: '',
      appointmentType: 'Regular',
      notes: '',
    });
    setRecordedText('');
    setAiMessage('');
  };
  
  // Start recording
  const startRecording = () => {
    // Check if SpeechRecognition is available
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setRecordingStatus('Speech recognition not supported in this browser.');
      return;
    }
    
    // Clear previous context
    setIsRecording(true);
    setRecordingStatus('Listening...');
    setRecordedText('');
    setAiMessage('');
    
    // Reset transcript ref
    currentTranscriptRef.current = '';
    
    // Reset field highlighting
    setHighlightedField(null);
    setShowSuccessAnimation(false);
    
    // Set up speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onstart = () => {
      setRecordingStatus('Listening...');
    };
    
    recognitionRef.current.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      // Update both the state and the ref
      setRecordedText(transcript);
      currentTranscriptRef.current = transcript;
    };
    
    recognitionRef.current.onerror = (event) => {
      setRecordingStatus(`Error: ${event.error}`);
      stopRecording();
    };
    
    recognitionRef.current.onend = () => {
      setRecordingStatus('Processing your voice input...');
      // Process using the ref value which has the latest transcript
      if (currentTranscriptRef.current) {
        processVoiceWithAI(currentTranscriptRef.current);
      } else {
        setRecordingStatus('No speech detected. Try again.');
      }
    };
    
    recognitionRef.current.start();
  };
  
  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Function to call the backend API with voice transcript
  const processVoiceWithAI = async (transcript) => {
    if (!transcript.trim()) {
      setRecordingStatus('No text to process. Please try again.');
      return;
    }
    
    setIsProcessing(true);
    setAiMessage('Extracting appointment details...');
    
    try {
      // Create a special prompt for the appointment form
      const appointmentPrompt = `
        You are a hospital management system assistant that helps fill in appointment forms.
        Parse the following spoken request and extract structured information for a patient appointment.
        
        Return the information in the following JSON format:
        {
          "patientId": "",
          "patientName": "",
          "doctorId": "",
          "doctorName": "",
          "date": "YYYY-MM-DD",
          "time": "HH:MM",
          "roomNo": "",
          "appointmentType": "Regular/Emergency/Follow-up/Consultation",
          "notes": ""
        }
        
        Only include fields that can be confidently extracted from the request. For appointment types, only use one of: Regular, Emergency, Follow-up, or Consultation.
        
        Voice transcript: ${transcript}
      `;

      // Send request to our backend API
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: appointmentPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const aiText = data.data;
        
        // Try to extract JSON from the response
        try {
          const jsonMatch = aiText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            const parsedData = JSON.parse(jsonStr);
            
            // Update form with the extracted data
            setFormData(prevData => {
              const newData = { ...prevData };
              const updatedFields = [];
              
              // Only update fields that are provided by the AI
              Object.keys(parsedData).forEach(key => {
                if (parsedData[key] && parsedData[key] !== '') {
                  newData[key] = parsedData[key];
                  updatedFields.push(key);
                }
              });
              
              // Set fields to highlight with animation
              if (updatedFields.length > 0) {
                for (const field of updatedFields) {
                  setTimeout(() => {
                    setHighlightedField(field);
                  }, 300);
                }
              }
              
              return newData;
            });
            
            setShowSuccessAnimation(true);
            setAiMessage('Form filled with the details from your voice input.');
          } else {
            setAiMessage('Could not extract structured data from your voice. Please try again with more details.');
          }
        } catch (err) {
          console.error('Error parsing JSON:', err);
          setAiMessage('Error processing the AI response. Please try again.');
        }
      } else {
        setAiMessage('No useful information extracted. Please try speaking more clearly and include more details.');
      }
    } catch (error) {
      console.error('API error:', error);
      setAiMessage(`Error: ${error.message}`);
    }
    
    setIsProcessing(false);
    setRecordingStatus('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 animate-fadeIn">
        Appointment Booking
      </h2>
      
      {/* Voice Assistant Section */}
      <div className="mb-6 bg-white p-6 rounded-md shadow-sm relative overflow-hidden animate-scaleIn">
        <h3 className="text-lg font-medium mb-3">Voice Assistant</h3>
        <p className="text-sm text-gray-600 mb-4">
          Press the button and speak the appointment details. Our AI will automatically fill the form for you.
          <br />
          Example: "Schedule a follow-up appointment for patient John Smith ID P12345 with Dr. Jane Wilson ID D789 on May 15th at 2:30 PM in room 302."
        </p>
        
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative flex items-center justify-center px-4 py-3 rounded-full shadow-md focus:outline-none transition-all transform active:scale-95 ${
              isRecording 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
            {isRecording && (
              <div className="absolute -inset-1 rounded-full border-2 border-red-400 opacity-75 animate-ping"></div>
            )}
          </button>
          
          {isProcessing && (
            <div className="flex items-center">
              <div className="ml-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              <span className="ml-2 text-sm text-gray-600">Processing...</span>
            </div>
          )}
        </div>
        
        {showSuccessAnimation && (
          <div className="absolute top-0 right-0 left-0 h-1 bg-green-500 animate-progressBar"></div>
        )}
        
        {/* Status Message */}
        {(recordingStatus || aiMessage) && (
          <div 
            className={`mt-4 p-3 text-sm rounded animate-fadeIn ${
              recordingStatus.includes('Error') || aiMessage.includes('Error')
                ? 'bg-red-100 text-red-700'
                : isRecording
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : aiMessage.includes('filled')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {recordingStatus || aiMessage}
            {recordedText && (
              <div className="mt-2 py-1 px-2 bg-white rounded font-medium text-gray-800">
                "{recordedText}"
              </div>
            )}
          </div>
        )}
      </div>
      
      <form
        onSubmit={handleSubmit} 
        className="bg-white p-6 rounded-md shadow-sm animate-slideUp"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <div className={`mb-4 ${highlightedField === 'patientId' ? 'animate-highlight' : ''}`}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Patient ID:
              </label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  highlightedField === 'patientId' 
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                    : 'border-gray-300'
                }`}
                required
              />
            </div>
            
            <div className={`mb-4 ${highlightedField === 'patientName' ? 'animate-highlight' : ''}`}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Patient Name:
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  highlightedField === 'patientName' 
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                    : 'border-gray-300'
                }`}
                required
              />
            </div>
            
            <div className={`mb-4 ${highlightedField === 'date' ? 'animate-highlight' : ''}`}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Date:
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  highlightedField === 'date' 
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                    : 'border-gray-300'
                }`}
                required
              />
            </div>
            
            <div className={`mb-4 ${highlightedField === 'time' ? 'animate-highlight' : ''}`}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Time:
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  highlightedField === 'time' 
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                    : 'border-gray-300'
                }`}
                required
              />
            </div>
          </div>
          
          {/* Right Column */}
          <div>
            <div className={`mb-4 ${highlightedField === 'doctorId' ? 'animate-highlight' : ''}`}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Doctor ID:
              </label>
              <input
                type="text"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  highlightedField === 'doctorId' 
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                    : 'border-gray-300'
                }`}
                required
              />
            </div>
            
            <div className={`mb-4 ${highlightedField === 'doctorName' ? 'animate-highlight' : ''}`}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Doctor Name:
              </label>
              <input
                type="text"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  highlightedField === 'doctorName' 
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                    : 'border-gray-300'
                }`}
                required
              />
            </div>
            
            <div className={`mb-4 ${highlightedField === 'roomNo' ? 'animate-highlight' : ''}`}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Room No:
              </label>
              <input
                type="text"
                name="roomNo"
                value={formData.roomNo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  highlightedField === 'roomNo' 
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                    : 'border-gray-300'
                }`}
                required
              />
            </div>
            
            <div className={`mb-4 ${highlightedField === 'appointmentType' ? 'animate-highlight' : ''}`}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Appointment Type:
              </label>
              <select
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                  highlightedField === 'appointmentType' 
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                    : 'border-gray-300'
                }`}
                required
              >
                <option value="Regular">Regular</option>
                <option value="Emergency">Emergency</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Consultation">Consultation</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Notes Section */}
        <div className={`mt-6 ${highlightedField === 'notes' ? 'animate-highlight' : ''}`}>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Notes:
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
              highlightedField === 'notes' 
                ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                : 'border-gray-300'
            }`}
            rows="4"
            placeholder="Add appointment notes here..."
          ></textarea>
        </div>
        
        {/* Submit Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            className="px-6 py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 shadow-md transform hover:scale-105 active:scale-95"
          >
            Submit
          </button>
        </div>
      </form>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes highlight {
          0% { background-color: rgba(16, 185, 129, 0.1); }
          50% { background-color: rgba(16, 185, 129, 0.3); }
          100% { background-color: rgba(16, 185, 129, 0.1); }
        }
        
        @keyframes progressBar {
          from { transform: scaleX(0); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-in-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-in-out;
        }
        
        .animate-highlight {
          animation: highlight 1.5s ease-in-out;
        }
        
        .animate-progressBar {
          animation: progressBar 2s ease-in-out;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default DoctorAddAppointment;