import { sendMessage } from '../config/sendMail.js';
import Employee from '../models/employee.js';

export const sendAdmin = async (req, res) => {
    
    try {
      const { subject, message, email } = req.body;
  
      const adminEmailList = await Employee.find({ role: 'admin' }).select('email');
      for (const admin of adminEmailList) {
        await sendMessage(subject, message, email, admin.email);
      }
  
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email', error });
    }
  };
  