import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import TextArea from '@mui/material/TextareaAutosize';
import axios from 'axios';

const ContactAdmin = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const email = "arush.shaleen@gmail.com"; // or get this dynamically
    const email = localStorage.getItem('email');
    
    // console.log(localStorage);
    try {
      const response = await axios.post('http://localhost:5000/api/employees/send', {
        subject,
        message,
        email
      });

      alert(response.data.message);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again later.');
    }
  };

  return (
    <div className="p-20">
      <h1 className="text-2xl font-bold mb-6">Contact Admin</h1>
      <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-4">
        <TextField
          label="Subject"
          variant="outlined"
          fullWidth
          margin="normal"
          className="mb-4"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <TextArea
          placeholder="Message"
          className="m-1 w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          minRows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className='w-full flex justify-end'>
          <Button
            type="submit"
            variant="contained"
            style={{ backgroundColor: '#4C7E75', color: 'white' }}
            className="mx-4"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactAdmin;
