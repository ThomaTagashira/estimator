import React, { useState, useEffect } from 'react';
import useCreateBusinessInfo from '../hooks/useCreateBusinessInfo';

const apiUrl = process.env.REACT_APP_API_URL;

const BusinessInfoPage = () => {
    const {
        businessInfo,
        handleBusinessInfoChange,
        handleBusinessSubmit,
        setBusinessInfo,  // Add this in the hook if not present
    } = useCreateBusinessInfo(apiUrl);

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
            console.log('API Response:', data);

            if (data && data.length > 0) {
                setBusinessInfo({
                    businessName: data[0].business_name || '',
                    businessAddress: data[0].business_address || '',
                    businessPhone: data[0].business_phone || '',
                    businessEmail: data[0].business_email || ''
                });
            } else {
                console.error('Business data not found');
            }
        };

        fetchBusinessData();
    }, [setBusinessInfo]);

    return (
        <div className="business-info-section">
            <h3>Business Information</h3>
            <div>
                <input
                    type="text"
                    name="businessName"
                    value={businessInfo.businessName}
                    onChange={handleBusinessInfoChange}
                    disabled={!isEditable}
                    placeholder="Business Name"
                />
            </div>
            <div>
                <input
                    type="text"
                    name="businessAddress"
                    value={businessInfo.businessAddress}
                    onChange={handleBusinessInfoChange}
                    disabled={!isEditable}
                    placeholder="Business Address"
                />
            </div>
            <div>
                <input
                    type="text"
                    name="businessPhone"
                    value={businessInfo.businessPhone}
                    onChange={handleBusinessInfoChange}
                    disabled={!isEditable}
                    placeholder="Business Phone"
                />
            </div>
            <div>
                <input
                    type="text"
                    name="businessEmail"
                    value={businessInfo.businessEmail}
                    onChange={handleBusinessInfoChange}
                    disabled={!isEditable}
                    placeholder="Business Email"
                />
            </div>

            <div className="edit-buttons">
                {!isEditable ? (
                    <button onClick={() => setIsEditable(true)}>Update</button>
                ) : (
                    <button onClick={handleBusinessSubmit}>Save</button>
                )}
            </div>
        </div>
    );
};

export default BusinessInfoPage;
