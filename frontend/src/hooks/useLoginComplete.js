import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserProfileSettings from './useUserProfileSettings';
import useCreateBusinessInfo from './useCreateBusinessInfo';
import axios from 'axios';

const useLoginComplete = (apiUrl, setHasActiveSubscription, setIsAuthenticated, setInTrial) => {
  const [step, setStep] = useState(1);

  const {
    userData,
    handleUserDataSave,
    handleUserDataChange,
  } = useUserProfileSettings(apiUrl);
    
  const {
    businessInfo,
    handleBusinessInfoChange,
    handleBusinessSubmit,
  } = useCreateBusinessInfo(apiUrl);


  const navigate = useNavigate();


  const handleNext = () => {
    localStorage.setItem('userData', JSON.stringify(userData,));
    setStep(2);
  };

  const handlePrevious = () => {
    localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
    setStep(1);
  };

  const handleLoginCompleteSubmit = async () => {
    try {
      await Promise.all([handleUserDataSave(), handleBusinessSubmit()]);
  
      await axios.post(`${apiUrl}/api/subscription/complete-profile/`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
  
      // alert('Data saved successfully!');
  
      setIsAuthenticated(true);
      setHasActiveSubscription(true);
      setInTrial(true);

      localStorage.removeItem('userData');
      localStorage.removeItem('businessInfo');

      navigate(`/`);
    } catch (error) {
      alert('Error saving data. Please check the logs for more details.');
      console.error('Error saving data:', error);
    }
  };
  
  
  const handleCancel = () => {
    localStorage.removeItem('clientInfo');
    localStorage.removeItem('projectInfo');

    navigate(`/`);
  };
  
  return {
    step,
    userData,
    businessInfo,
    handleUserDataChange,
    handleBusinessInfoChange,
    handleNext,
    handlePrevious,
    handleLoginCompleteSubmit,
    handleCancel
  };
};

export default useLoginComplete;
