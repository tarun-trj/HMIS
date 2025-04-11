import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faUser } from '@fortawesome/free-solid-svg-icons';

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  
  // API configuration - using environment variables
  const API_KEY = '';
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  useEffect(() => {
    // Add welcome message when component mounts
    setMessages([
      { 
        text: "Hello! I'm your Hospital Management System support assistant. How can I help you today?", 
        sender: 'bot' 
      }
    ]);
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
    e.preventDefault();
    
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

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Main content area - full width */}
      <div className="flex-1 w-full h-full">
        <div className="w-full h-full bg-white overflow-hidden flex flex-col shadow-lg">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <h1 className="text-2xl font-bold">Support Assistant</h1>
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
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-md ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-100 text-emerald-600 ml-2' 
                      : 'bg-teal-100 text-teal-600 mr-2'
                  }`}>
                    <FontAwesomeIcon icon={msg.sender === 'user' ? faUser : faRobot} size="sm" />
                  </div>
                  <div 
                    className={`p-4 rounded-2xl shadow-sm transition-all duration-300 ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-gray-800 border-emerald-200 border' 
                        : 'bg-white hover:bg-gray-50 text-gray-800 border-teal-200 border'
                    }`}
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
              <div className="flex justify-start">
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
          </div>
          
          {/* Input area - fixed to bottom */}
          <div className="border-t p-4 bg-white sticky bottom-0 left-0 right-0 w-full">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the hospital system..."
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-teal-400 transition-colors"
              />
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-xl transition-all duration-300 flex items-center justify-center shadow hover:shadow-lg transform hover:scale-105 active:scale-95"
                disabled={!input.trim()}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;