# Support Component Documentation

## Component Overview

The Support component is a real-time chat interface for a Hospital Management System that facilitates communication between users and an AI-powered support assistant. It features a modern, animated UI with text and voice input capabilities, text-to-speech output, and integration with a backend API that uses Gemini AI for generating responses.

## State Management

The component manages several pieces of state:

* **chatHistory**: Array of message objects tracking the conversation history, with each message containing:
  - `id` - Unique identifier for the message
  - `text` - The message content
  - `sender` - Either 'user' or 'bot'
  - `rawText` - Original unformatted text for bot messages

* **userInput**: String storing the current text input from the user

* **isBotTyping**: Boolean controlling the display of the typing indicator animation

* **isVoiceRecording**: Boolean tracking if voice input is currently active

* **voiceInputStatus**: String providing feedback about the voice input state

* **displayWelcome**: Boolean determining if the welcome message should be displayed

* **isSpeaking**: Boolean tracking if text-to-speech is currently active

* **currentlySpeakingMessageId**: String identifier of the message currently being spoken

## Data Fetching Implementation

The component communicates with a backend API that integrates with Google's Gemini AI:

1. API calls are made using the `callGeminiAPI` function which sends POST requests to the endpoint defined by `BACKEND_API_URL` (http://localhost:5000/api/gemini)

2. User messages are sent as JSON in the request body

3. The function handles error states with specific error messages based on the type of failure

4. Successful responses are expected to include a `success` flag and a `data` property containing the AI-generated response

## Implementation Details for Specific Features

### Voice Input
- Uses the Web Speech API's SpeechRecognition interface
- Maintains continuous listening until manually stopped
- Provides real-time visual feedback during recording
- Auto-restart mechanism if recognition ends unexpectedly

### Text-to-Speech
- Implements the SpeechSynthesis API to read bot messages aloud
- Cleans HTML formatting from bot responses before speaking
- Supports stopping speech playback
- Visual indicators show which message is currently being spoken

### Response Formatting
- Parses markdown-style formatting from bot responses:
  - Converts `**text**` to bold text (`<strong>` tags)
  - Converts `*text*` to italic text (`<em>` tags)
  - Transforms line breaks into HTML `<br />` elements

## Configuration Aspects

- **API Endpoint**: Configured via the `BACKEND_API_URL` constant
- **Speech Recognition**: Set to use US English language with continuous recognition
- **Speech Synthesis**: Configured with US English, default speech rate and pitch
- **Welcome Message**: Set to display after a 500ms delay

## Rendering Logic

The component's render structure is divided into these main sections:

1. **Main Container**: A full-screen flex container with subtle background pattern
2. **Header**: Gradient-colored bar with animated title
3. **Chat Messages Container**:
   - Scrollable area displaying all messages
   - Different styling for user vs. bot messages
   - Animation effects for message appearance
   - Text-to-speech controls for bot messages
4. **Typing Indicator**: Animated dots showing when the bot is generating a response
5. **Voice Input Status**: Feedback bar for speech recognition status
6. **Input Area**: Form with text input, voice recording toggle, and send button

## Main Processing Flow

1. **Initialization**:
   - Component mounts and displays welcome message after delay
   - Sets up scroll behavior and event listeners

2. **User Input Processing**:
   - User enters text or uses voice input
   - On submission, the message is added to chat history
   - User input field is cleared

3. **API Interaction**:
   - Shows typing indicator
   - Sends request to backend API
   - Handles potential errors

4. **Response Handling**:
   - Formats received bot response (parsing markdown-style formatting)
   - Adds formatted response to chat history
   - Updates scroll position to show newest message

5. **Voice Interaction**:
   - Voice input can be toggled on/off
   - Speech recognition converts speech to text
   - Bot responses can be read aloud using text-to-speech
   - Speech synthesis can be stopped at any time

The component includes extensive CSS animations that create a polished, engaging user experience with smooth transitions and visual feedback throughout the interaction flow.