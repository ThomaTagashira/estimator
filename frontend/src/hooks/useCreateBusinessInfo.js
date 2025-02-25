import { useState, useCallback } from 'react';
import refreshAccessToken from '../components/utils/refreshAccessToken';
import validateBusinessInfo from '../components/utils/validateBusinessInfo';

const useCreateBusinessInfo = (apiUrl) => {
    const [businessInfo, setBusinessInfo] = useState({
        businessName: '',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
    });

    const [error, setError] = useState(null);
    const [isBusinessEditable, setIsBusinessEditable] = useState(false);
    const [originalBusinessData, setOriginalBusinessData] = useState({}); 

    const accessToken = localStorage.getItem('access_token');

    const handleBusinessInfoChange = (e) => {
        const { name, value } = e.target;
        setBusinessInfo({ ...businessInfo, [name]: value });
    };

    const handleBusinessSubmit = async () => {
        localStorage.setItem('businessInfo', JSON.stringify(businessInfo));

        if (!accessToken) {
            console.error('No authentication token found');
            return;
        }
        
        const businessPayload = {
                business_name: businessInfo.businessName,
                business_address: businessInfo.businessAddress,
                business_phone: businessInfo.businessPhone,
                business_email: businessInfo.businessEmail,
        };
        console.log('businessPayload', JSON.stringify(businessPayload));

        if (!validateBusinessInfo(businessInfo)) {
          return;
        }

        try {
            let response = await fetch(`${apiUrl}/api/save-business-info/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(businessPayload),
            });

            if (response.status === 401) {
            console.log('Access token expired, trying to refresh...');
            console.log(businessPayload);

            const newAccessToken = await refreshAccessToken(apiUrl);

            if (newAccessToken) {
                response = await fetch(`${apiUrl}/api/save-business-info/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${newAccessToken}`,
                },
                body: JSON.stringify(businessPayload),
                });
            } else {
                console.error('Unable to refresh access token');
                return;
            }
            }

            const responseData = await response.json();

            if (response.ok) {
            console.log('Business Info created successfully', responseData);
            setIsBusinessEditable(false);
        } else {
            console.error('Failed to create Business Info', responseData);
            setError('Failed to create Business Info');
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            setError('Failed to save the Business Info');
        }
    };

    const handleBusinessCancel = () => {
        setOriginalBusinessData(originalBusinessData);
        setIsBusinessEditable(false);
    };


    const fetchBusinessData = useCallback(async () => {
      const accessToken = localStorage.getItem('access_token');
      try {
        const response = await fetch(`${apiUrl}/api/get-saved-business-info/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
    
        const data = await response.json();
        console.log('API Response:', data);
    
        if (data && data.length > 0) {
          const businessData = {
            businessName: data[0].business_name || '',
            businessAddress: data[0].business_address || '',
            businessPhone: data[0].business_phone || '',
            businessEmail: data[0].business_email || '',
          };
    
          setBusinessInfo(businessData);
          setOriginalBusinessData(businessData);
        } else {
          console.error('Business data not found');
          alert('No business data found. Please create it.');
        }
      } catch (error) {
        console.error('Error fetching business data:', error);
        alert('Failed to fetch business data. Please try again.');
      }
    }, [apiUrl]);
    

        return {
            businessInfo,
            handleBusinessInfoChange,
            handleBusinessSubmit,
            setBusinessInfo,
            isBusinessEditable,
            setIsBusinessEditable,
            error,
            originalBusinessData,
            setOriginalBusinessData,
            handleBusinessCancel,
            fetchBusinessData,
        };
    };

export default useCreateBusinessInfo;
