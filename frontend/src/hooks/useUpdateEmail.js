import { useState } from 'react';
import axios from 'axios';

const useUpdateEmail = (apiUrl) => {
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailUpdate = async () => {
    if (!newEmail || !confirmEmail) {
      setError('Please confirm Email');
      return;
    }
  
    try {
      const response = await updateEmail(newEmail, confirmEmail);
      console.log('Email update response:', response);
      setNewEmail(''); 
      setConfirmEmail('');
    } catch (err) {
      console.error('Error updating email:', err);
    }
  };


  const updateEmail = async (newEmail, confirmEmail) => {
    setLoading(true);
    setError('');
    setSuccess('');
  
    if (newEmail !== confirmEmail) {
      setError('Emails do not match.');
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.post(
        `${apiUrl}/api/update-email/`,
        { email: newEmail },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
  
      setSuccess(response.data.message);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
          const apiErrors = err.response.data;
          if (apiErrors.email) {
              setError(apiErrors.email[0]); 
          } else if (apiErrors.old_email) {
              setError(apiErrors.old_email[0]);
          } else {
              setError('An unexpected error occurred. Please try again.');
          }
      } else {
          setError('An unexpected error occurred. Please try again.');
      }
      console.error('Error updating email:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    newEmail,
    setNewEmail,
    confirmEmail,
    setConfirmEmail,
    error,
    success,
    handleEmailUpdate,
    updateEmail,
    loading,
  };
};

export default useUpdateEmail;