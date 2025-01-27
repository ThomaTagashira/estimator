import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useUpdatePassword = (apiUrl) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showStrength, setShowStrength] = useState(false);
  const navigate = useNavigate();

  const calculatePasswordStrength = (newPassword) => {
    let score = 0;
    if (newPassword.length >= 8) score += 1; 
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1; 
    if (/[\W_]/.test(newPassword)) score += 1;
    return score;
  };
  
  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
      case 5:
        return 'Strong';
      default:
        return '';
    }
  };
  
  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'red';
      case 2:
        return 'orange';
      case 3:
        return 'yellow';
      case 4:
      case 5:
        return 'green';
      default:
        return '';
    }
  };

  const handlePasswordChange = (e) => {
	const newPassword = e.target.value;
	setNewPassword(newPassword);
	const strength = calculatePasswordStrength(newPassword);
	setPasswordStrength(strength);
};

const handleCancel = () => {
  navigate(`/user-profile-settings`);
};

  const handlePasswordUpdate = async () => {
    try {
      const response = await updatePassword(newPassword, confirmPassword);
      console.log('Password update response:', response);
    } catch (err) {
      console.error('Error updating password:', err);
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
      setNewPassword('');
      setConfirmPassword('');
      setShowStrength(false);
    }
  };

  return {
    newPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    handlePasswordUpdate,
    loading,
    getStrengthColor,
    getStrengthLabel,
    handlePasswordChange,
    setShowStrength,
    showStrength,
    handleCancel
  };
};

export default useUpdatePassword;