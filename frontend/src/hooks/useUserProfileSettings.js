import { useState, useCallback } from 'react';
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
  const [error, setError] = useState('');



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
        // alert('Error saving user data. Please try again.');
        return;
      }
  
      console.log('User data updated successfully');
      setOriginalUserData(updatedUserData);
      setIsUserDataEditable(false);
    } catch (error) {
      console.error('Error saving user data:', error);
      // alert('An unexpected error occurred. Please try again.');
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
      // alert('Failed to fetch user data. Please try again.');
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
    error,
    setError,
  };
};

export default useUserProfileSettings;
