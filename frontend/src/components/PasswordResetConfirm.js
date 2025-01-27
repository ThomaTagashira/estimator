import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PasswordResetConfirm = () => {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/api/password-reset-confirm/`, {
        uid,
        token,
        new_password: newPassword,
      });
      setMessage(response.data.message);
      setError(''); 
    } catch (error) {
      setError('An error occurred. Please try again.');
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Set New Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}   
       
    </div>
  );
};

export default PasswordResetConfirm;
