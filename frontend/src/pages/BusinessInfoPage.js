import React, { useEffect } from 'react';
import useCreateBusinessInfo from '../hooks/useCreateBusinessInfo';


const apiUrl = process.env.REACT_APP_API_URL;

const BusinessInfoPage = () => {
    const {
        businessInfo,
        handleBusinessInfoChange,
        handleBusinessSubmit,
        setBusinessInfo,
        isBusinessEditable,
        setIsBusinessEditable,
        handleBusinessCancel,
        fetchBusinessData
    } = useCreateBusinessInfo(apiUrl);

    useEffect(() => {
        fetchBusinessData();
    }, [setBusinessInfo]);


    return (
        <div className='page'>
            <div className="create-estimate-container">
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
                            disabled={!isBusinessEditable}
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
                            disabled={!isBusinessEditable}
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
                            disabled={!isBusinessEditable}
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
                            disabled={!isBusinessEditable}
                            placeholder="Enter Your Business Email"
                        />
                    </div>
                    <div className='single-button'>
                        {!isBusinessEditable ? (
                            <button
                                type="button"
                                className="upload-btn"
                                onClick={() => setIsBusinessEditable(true)}
                            >
                                Edit Business Info
                            </button>
                    
                        ) : (
                            <div className="button-group">
                                <>
                                    <button
                                        type="button"
                                        className="upload-btn"
                                        onClick={handleBusinessCancel}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="upload-btn"
                                        onClick={handleBusinessSubmit}
                                    >
                                        Save
                                    </button>
                                </>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BusinessInfoPage;
