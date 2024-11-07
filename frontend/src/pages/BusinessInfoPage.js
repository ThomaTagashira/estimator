import React, { useState, useEffect } from 'react';
import BusinessInfoForm from '../components/Form/BusinessInfoForm';
import useCreateBusinessInfo from '../hooks/useCreateBusinessInfo';

const apiUrl = process.env.REACT_APP_API_URL;

const BusinessInfoPage = () => {
    const {
        businessInfo,
        handleBusinessInfoChange,
        handleBusinessSubmit,
    } = useCreateBusinessInfo(apiUrl);

    const [businessName, setBusinessName] = useState('');
    const [businessAddress, setBusinessAddress] = useState('');
    const [businessPhone, setBusinessPhone] = useState('');
    const [businessEmail, setBusinessEmail] = useState('');
    const [originalBusinessInfo, setOriginalBusinessInfo] = useState({});
    const [isEditable, setIsEditable] = useState(false);

    useEffect(() => {
        const fetchBusinessData = async () => {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(`${apiUrl}/api/get-saved-business-info/`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });

            const data = await response.json();

            console.log('API Response:', data); // Check structure

            if (data && data.length > 0) {  // Check if the array has entries
                setBusinessName(data[0].business_name || '');
                setBusinessAddress(data[0].business_address || '');
                setBusinessPhone(data[0].business_phone || '');
                setBusinessEmail(data[0].business_email || '');

                setOriginalBusinessInfo(data[0]);
            } else {
                console.error('Business data not found');
            }
        };

        fetchBusinessData();
      }, [apiUrl]);

    return (
        <div className="business-info-section">
        <h3>Business Information</h3>
        <div>
          <input
            type="text"
            value={businessName}
            onChange={(e) => handleBusinessInfoChange(e.target.value)}
            disabled={!isEditable}
            placeholder="Business Name"
          />
        </div>
        <div>
          <input
            type="text"
            value={businessAddress}
            onChange={(e) => handleBusinessInfoChange(e.target.value)}
            disabled={!isEditable}
            placeholder="Business Address"
          />
        </div>
        <div>
          <input
            type="text"
            value={businessPhone}
            onChange={(e) => handleBusinessInfoChange(e.target.value)}
            disabled={!isEditable}
            placeholder="Business Phone"
          />
        </div>
        <div>
          <input
            type="text"
            value={businessEmail}
            onChange={(e) => handleBusinessInfoChange(e.target.value)}
            disabled={!isEditable}
            placeholder="Business Email"
          />
        </div>

        <div className="edit-buttons">
        {!isEditable ? (
          <button onClick={() => setIsEditable(true)}>Edit</button>
        ) : (
          <button onClick={handleBusinessSubmit}>Save</button>
        )}
        </div>
    </div>
    )
};

export default BusinessInfoPage