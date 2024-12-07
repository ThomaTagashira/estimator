import React, { useState, useEffect } from 'react';
import useCreateBusinessInfo from '../hooks/useCreateBusinessInfo';


const apiUrl = process.env.REACT_APP_API_URL;

const BusinessInfoPage = () => {
    const {
        businessInfo,
        handleBusinessInfoChange,
        handleBusinessSubmit,
        setBusinessInfo,
    } = useCreateBusinessInfo(apiUrl);

    const [isEditable, setIsEditable] = useState(false);
    const [originalData, setOriginalData] = useState({}); // To store the original data

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
                const businessData = {
                    businessName: data[0].business_name || '',
                    businessAddress: data[0].business_address || '',
                    businessPhone: data[0].business_phone || '',
                    businessEmail: data[0].business_email || '',
                };
                setBusinessInfo(businessData);
                setOriginalData(businessData); // Store the original data
            } else {
                console.error('Business data not found');
            }
        };

        fetchBusinessData();
    }, [setBusinessInfo]);

    const handleCancel = () => {
        setBusinessInfo(originalData); // Revert changes to the original data
        setIsEditable(false); // Disable editing
    };

    return (
        <div className="form-container">
            <h3>Business Information</h3>
            <form>
                <div className="form-group">
                    <label htmlFor="businessName">
                        <span className="form-icon">🏢</span> Business Name
                    </label>
                    <input
                        id="businessName"
                        type="text"
                        name="businessName"
                        value={businessInfo.businessName}
                        onChange={handleBusinessInfoChange}
                        disabled={!isEditable}
                        placeholder="Enter Your Business Name"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="businessAddress">
                        <span className="form-icon">📍</span> Business Address
                    </label>
                    <input
                        id="businessAddress"
                        type="text"
                        name="businessAddress"
                        value={businessInfo.businessAddress}
                        onChange={handleBusinessInfoChange}
                        disabled={!isEditable}
                        placeholder="Enter Your Business Address"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="businessPhone">
                        <span className="form-icon">📞</span> Business Phone
                    </label>
                    <input
                        id="businessPhone"
                        type="text"
                        name="businessPhone"
                        value={businessInfo.businessPhone}
                        onChange={handleBusinessInfoChange}
                        disabled={!isEditable}
                        placeholder="Enter Your Business Phone"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="businessEmail">
                        <span className="form-icon">✉️</span> Business Email
                    </label>
                    <input
                        id="businessEmail"
                        type="text"
                        name="businessEmail"
                        value={businessInfo.businessEmail}
                        onChange={handleBusinessInfoChange}
                        disabled={!isEditable}
                        placeholder="Enter Your Business Email"
                    />
                </div>
                <div className="button-group">
                    {!isEditable ? (
                        <button
                            type="button"
                            className="next-btn"
                            onClick={() => setIsEditable(true)}
                        >
                            Update
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="next-btn save-button"
                                onClick={handleBusinessSubmit}
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                className="next-btn cancel-button"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default BusinessInfoPage;
