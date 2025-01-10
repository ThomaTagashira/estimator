import { useState, useCallback } from 'react';
import axios from 'axios';
import validateUserData from '../components/utils/validateUserData';

const useUserProfileSettings = (apiUrl) => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    zipcode: '',
  });

  const [originalUserData, setOriginalUserData] = useState(null);
  const [isUserDataEditable, setIsUserDataEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // for when im ready to separate error messages
  // const [passwordError, setPasswordError] = useState('');
  // const [emailError, setEmailError] = useState('');
  // const [emailSuccess, setEmailSuccess] = useState('');
  // const [passwordSuccess, setPasswordSuccess] = useState('');


  const handleUserDataCancel = () => {
    setOriginalUserData(originalUserData);
    setIsUserDataEditable(false); 
  };

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleUserDataSave = async () => {
    const accessToken = localStorage.getItem('access_token');
  
    const updatedUserData = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone_number: userData.phone,
      zipcode: userData.zipcode,
    };
  
    if (!validateUserData(userData)) {
      return;
    }
  
    if (JSON.stringify(updatedUserData) === JSON.stringify(originalUserData)) {
      console.log('No changes made to user data');
      setIsUserDataEditable(false);
      return;
    }
  
    try {
      const response = await fetch(`${apiUrl}/api/save-user-info/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_data: updatedUserData }),
      });
  
      if (!response.ok) {
        console.error('Failed to update user data:', response.status, response.statusText);
        alert('Error saving user data. Please try again.');
        return;
      }
  
      console.log('User data updated successfully');
      setOriginalUserData(updatedUserData);
      setIsUserDataEditable(false);
    } catch (error) {
      console.error('Error saving user data:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };
  
  const updateEmail = async (newEmail) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${apiUrl}/api/update-email/`, {
        email: newEmail,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      setSuccess('Email updated successfully!');
      return response.data; 
    } catch (err) {
      setError('Emails do not match.');
      console.error(err);
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${apiUrl}/api/update-password/`, {
        new_password: newPassword, 
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      setSuccess('Password updated successfully!');
      return response.data; 
    } catch (err) {
      console.error('Error response:', error.response?.data); 
      console.error(err);
      throw err; 
    } finally {
      setLoading(false);
    }
  };


  const fetchUserData = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`${apiUrl}/api/get-user-profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user data.');
      }
  
      const data = await response.json();
  
      setUserData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        phone: data.phone_number || '',
        zipcode: data.zipcode || '',
      });
      setOriginalUserData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        phone: data.phone_number || '',
        zipcode: data.zipcode || '',
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Failed to fetch user data. Please try again.');
    }
  }, [apiUrl]); 


  return {
    userData,
    setUserData,
    handleUserDataSave,
    isUserDataEditable,
    setIsUserDataEditable,
    handleUserDataCancel,
    setOriginalUserData,
    fetchUserData,
    handleUserDataChange,
    updateEmail,
    updatePassword,
    loading,
    error,
    success,
  };
};

export default useUserProfileSettings;
