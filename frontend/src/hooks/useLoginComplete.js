import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserProfileSettings from './useUserProfileSettings';
import useCreateBusinessInfo from './useCreateBusinessInfo';

const useLoginComplete = (apiUrl) => {
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
      alert('Data saved successfully!');
    } catch (error) {
      alert('Error saving data. Please check the logs for more details.');
      console.error('Error saving data:', error);
    }

    navigate(`/`);
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
