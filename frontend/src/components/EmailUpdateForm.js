import React, { useState } from 'react';
import axios from 'axios';

const EmailUpdateForm = ({apiUrl}) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/update-email/`, { email });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response.data.email || 'An error occurred.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter new email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Update Email</button>
      <p>{message}</p>
    </form>
  );
};

export default EmailUpdateForm;
