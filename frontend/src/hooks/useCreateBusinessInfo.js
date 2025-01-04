import { useState } from 'react';
import refreshAccessToken from '../components/utils/refreshAccessToken';

const useCreateBusinessInfo = (apiUrl) => {
    const [businessInfo, setBusinessInfo] = useState({
        businessName: '',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
    });

    const [error, setError] = useState(null);
    const [isEditable, setIsEditable] = useState(false);

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
            setIsEditable(false);
        } else {
            console.error('Failed to create Business Info', responseData);
            setError('Failed to create Business Info');
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            setError('Failed to save the Business Info');
        }
    };

        return {
            businessInfo,
            handleBusinessInfoChange,
            handleBusinessSubmit,
            setBusinessInfo,
            isEditable,
            setIsEditable,
            error,
        };
    };

export default useCreateBusinessInfo;
