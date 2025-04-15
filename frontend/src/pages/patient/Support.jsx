import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faUser, faMicrophone, faMicrophoneSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // API configuration - using environment variables
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const API_URL = import.meta.env.VITE_GEMINI_API_URL;

  useEffect(() => {
    // Add welcome message when component mounts with animation delay
    setTimeout(() => {
      setShowWelcome(true);
      setMessages([
        { 
          text: "Hello! I'm your Hospital Management System support assistant. How can I help you today?", 
          sender: 'bot' 
        }
      ]);
    }, 500);
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Add effect to handle keeping the chat container in view
  useEffect(() => {
    const handleScroll = () => {
      // When user scrolls back down, make sure chat input stays visible
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // If we're near the bottom of the page, scroll to the bottom
      if (documentHeight - (scrollPosition + windowHeight) < 100) {
        window.scrollTo(0, documentHeight);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      const response = await callGeminiAPI(input);
      setIsTyping(false);
      
      if (response) {
        // Process response text to handle markdown-style formatting
        const formattedResponse = formatBotResponse(response);
        setMessages(prev => [...prev, { text: formattedResponse, sender: 'bot' }]);
      } else {
        setMessages(prev => [
          ...prev, 
          { text: "I'm sorry, I couldn't process your request. Please try again.", sender: 'bot' }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { text: "I'm sorry, there was an error processing your request. Please try again later.", sender: 'bot' }
      ]);
    }
  };

  // Function to format bot responses, handling asterisks and other markdown-like syntax
  const formatBotResponse = (text) => {
    // Parse and convert **text** to <strong>text</strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Parse and convert *text* to <em>text</em> (but only if not already part of **)
    formattedText = formattedText.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    
    // Handle line breaks
    formattedText = formattedText.replace(/\n/g, '<br />');
    
    return formattedText;
  };

  const callGeminiAPI = async (message) => {
    console.log('Making API call with message:', message);

    // Check if API key is available
    if (!API_KEY) {
      console.error('API key is not defined in environment variables');
      throw new Error('API key is missing');
    }

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are a helpful assistant for a Hospital Management System. 
                    Respond to the following question with helpful information:
                    System Features:
                    1. Profile Management
                    - View personal patient information
                    - Update personal details
                    - See basic health metrics (age, blood group, height, weight)
                    - Bed and room assignment

                    2. Appointments Management
                    - View scheduled appointments
                    - See appointment status (Scheduled/Completed)
                    - Appointments with different doctors (Dr. Smith, Dr. Johnson, Dr. Lee)

                    3. Consultations
                    - Book a new consultation
                    - View previous consultations
                    - View booked consultations
                    - Access daily progress and consultation history

                    4. Billing
                    - Access and manage medical bills

                    5. Feedback System
                    - Provide ratings and comments about consultations
                    - Select specific consultations for feedback
                    - Rate experience with star system

                    6. Help and Support
                    - Access customer support information

                    Contact Information:
                    - Email: patient@hospital.com
                    - Phone: +1 (555) 123-4567

                    Guidelines:
                    - Be patient-centric and empathetic
                    - Provide clear, concise instructions
                    - Help users navigate system features
                    - If query is complex, suggest contacting customer support 
                    ${message}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected API response format:', data);
        return null;
      }
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  };

  // Speech recognition functions
  const startRecording = () => {
    // Check if SpeechRecognition is available
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setRecordingStatus('Speech recognition not supported in this browser.');
      return;
    }
    
    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true; // Keep listening until manually stopped
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setRecordingStatus('Listening...');
    };
    
    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setInput(transcript);
      
      // Update status with real-time indication that voice is being recognized
      setRecordingStatus('Listening... (Voice detected)');
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setRecordingStatus(`Error: ${event.error}`);
      // Don't stop recording automatically on error
    };
    
    recognitionRef.current.onend = () => {
      // Only reset status if we're not in an error state
      if (recordingStatus === 'Listening...' || recordingStatus === 'Listening... (Voice detected)') {
        setRecordingStatus('Voice input ready. Click send to submit.');
      }
      
      // If recognition ends unexpectedly but user hasn't clicked stop, restart it
      if (isRecording && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Could not restart recognition', error);
          setIsRecording(false);
        }
      }
    };
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition', error);
      setRecordingStatus('Failed to start voice recognition.');
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setRecordingStatus('Voice input ready. Click send to submit.');
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Main content area - full width */}
      <div className="flex-1 w-full h-full">
        <div className="w-full h-full bg-white overflow-hidden flex flex-col shadow-lg">
          {/* Header with animation */}
          <div className="p-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white animate-gradient-x">
            <h1 className="text-2xl font-bold flex items-center">
              <span className="mr-2 animate-pulse">🏥</span>
              Support Assistant
            </h1>
          </div>
          
          {/* Chat messages container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-6 overflow-y-auto flex flex-col space-y-6 h-full"
            style={{ flex: '1 1 auto', backgroundImage: 'radial-gradient(circle at center, #f3f4f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          >
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`flex max-w-md ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-100 text-emerald-600 ml-2 animate-bounceIn' 
                      : 'bg-teal-100 text-teal-600 mr-2 animate-bounceIn'
                  }`}
                  style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
                  >
                    <FontAwesomeIcon icon={msg.sender === 'user' ? faUser : faRobot} size="sm" />
                  </div>
                  <div 
                    className={`p-4 rounded-2xl shadow-sm transition-all duration-300 ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-gray-800 border-emerald-200 border animate-slideInLeft' 
                        : 'bg-white hover:bg-gray-50 text-gray-800 border-teal-200 border animate-slideInRight'
                    }`}
                    style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
                    dangerouslySetInnerHTML={
                      msg.sender === 'bot' 
                        ? { __html: msg.text } 
                        : undefined
                    }
                  >
                    {msg.sender === 'user' ? msg.text : null}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 mr-2">
                    <FontAwesomeIcon icon={faRobot} size="sm" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recording status */}
            {recordingStatus && (
              <div className="flex justify-center animate-fadeIn">
                <div className="bg-blue-50 p-2 px-4 rounded-full border border-blue-200 text-blue-700 text-sm flex items-center space-x-2">
                  {isRecording && (
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                  <span>{recordingStatus}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area - fixed to bottom with animations */}
          <div className="border-t p-4 bg-white sticky bottom-0 left-0 right-0 w-full animate-slideUp">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the hospital system..."
                className={`flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-teal-400 transition-colors ${isRecording ? 'border-red-400 bg-red-50' : ''}`}
              />
              
              {/* Microphone button */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center shadow hover:shadow-lg transform hover:scale-105 active:scale-95 ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <FontAwesomeIcon 
                  icon={isRecording ? faMicrophoneSlash : faMicrophone} 
                  className={isRecording ? 'animate-pulse' : ''}
                />
              </button>
              
              {/* Send button */}
              <button
                type="submit"
                className={`bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-xl transition-all duration-300 flex items-center justify-center shadow hover:shadow-lg transform hover:scale-105 active:scale-95 ${!input.trim() ? 'opacity-50 cursor-not-allowed' : 'animate-bounce-subtle'}`}
                disabled={!input.trim()}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Add global CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulseRing {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(0.8); }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
        
        .animate-pulseRing {
          animation: pulseRing 2s infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Support;