import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import refreshAccessToken from '../components/utils/refreshAccessToken';

const useCreateEstimate = (apiUrl) => {
  const [step, setStep] = useState(1);
  const [clientInfo, setClientInfo] = useState({
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
  });
  const [projectInfo, setProjectInfo] = useState({
    projectName: '',
    projectLocation: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState(null);
  const [estimateId, setEstimateId] = useState(null);

  const navigate = useNavigate();
  const accessToken = localStorage.getItem('access_token');

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  const handleProjectInfoChange = (e) => {
    const { name, value } = e.target;
    setProjectInfo({ ...projectInfo, [name]: value });
  };

  const handleNext = () => {
    localStorage.setItem('clientInfo', JSON.stringify(clientInfo));
    setStep(2);
  };

  const handlePrevious = () => {
    localStorage.setItem('projectInfo', JSON.stringify(projectInfo));
    setStep(1);
  };

  const handleSubmit = async () => {
    localStorage.setItem('clientInfo', JSON.stringify(clientInfo));
    localStorage.setItem('projectInfo', JSON.stringify(projectInfo));
  
    if (!accessToken) {
      console.error('No authentication token found');
      return;
    }

    const estimateData = {
      client: {
        clientName: clientInfo.clientName,
        clientAddress: clientInfo.clientAddress,
        clientPhone: clientInfo.clientPhone,
        clientEmail: clientInfo.clientEmail,
      },
      project: {
        projectName: projectInfo.projectName,
        projectLocation: projectInfo.projectLocation,
        startDate: projectInfo.startDate || null,
        endDate: projectInfo.endDate || null,
      },
    };
  
    try {
      let response = await fetch(`${apiUrl}/api/estimates/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(estimateData),
      });
  
      if (response.status === 401) {
        console.log('Access token expired, trying to refresh...');
        console.log(estimateData);
  
        const newAccessToken = await refreshAccessToken(apiUrl);
  
        if (newAccessToken) {
          response = await fetch(`${apiUrl}/api/estimates/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newAccessToken}`,
            },
            body: JSON.stringify(estimateData),
          });
        } else {
          console.error('Unable to refresh access token');
          return;
        }
      }
  
      const responseData = await response.json();
      setEstimateId(responseData.estimateId);
  
      if (response.ok) {
        console.log('Estimate created successfully', responseData);

        localStorage.removeItem('clientInfo');
        localStorage.removeItem('projectInfo');
        
        navigate(`/search?estimateId=${responseData.estimate_id}`);
      } else {
        console.error('Failed to create estimate', responseData);
        setError('Failed to create estimate');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('Failed to save the estimate details');
    }
  };
  
  const handleCancel = () => {
    localStorage.removeItem('clientInfo');
    localStorage.removeItem('projectInfo');

    navigate(`/`);
  };
  
  return {
    step,
    clientInfo,
    projectInfo,
    estimateId,
    error,
    handleClientInfoChange,
    handleProjectInfoChange,
    handleNext,
    handlePrevious,
    handleSubmit,
    handleCancel
  };
};

export default useCreateEstimate;
