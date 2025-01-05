import React, { useEffect } from 'react';
import useUserProfileSettings from '../hooks/useUserProfileSettings';
import useCreateBusinessInfo from '../hooks/useCreateBusinessInfo';
import { Link } from 'react-router-dom';

const UserProfileSettingsPage = ({apiUrl}) => {
  const {
    userData,
    setUserData,
    handleUserDataSave,
    isUserDataEditable,  
    setIsUserDataEditable,
    handleUserCancel,
    setOriginalUserData,
    fetchUserData,
    handleUserDataChange
  } = useUserProfileSettings(apiUrl);

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
}, [setBusinessInfo,fetchBusinessData]);

  useEffect(() => {
    fetchUserData();
  }, [apiUrl, setUserData, setOriginalUserData, fetchUserData]);


return (
  <div className='page'>
    <h2>Profile Settings</h2>

      <div>    
        <h3>User Information</h3>
        <div className="DT-form-group">
          <label htmlFor="firstName">
            <span className="form-icon">✉️</span> First Name
          </label>
          <input
            id="firstName"
            type="text"
            name="firstName"            
            value={userData.firstName}
            onChange={handleUserDataChange}
            disabled={!isUserDataEditable}
            placeholder="First Name"
          />
        </div>

        <div className="DT-form-group">
          <label htmlFor="lastName">
            <span className="form-icon">✉️</span> Last Name
          </label>
          <input
            id="lastName"
            type="text"
            name="lastName"   
            value={userData.lastName}
            onChange={handleUserDataChange}
            disabled={!isUserDataEditable}
            placeholder="Last Name"
          />
        </div>

        <div className="DT-form-group">
          <label htmlFor="phone">
            <span className="form-icon">✉️</span> Phone Number
          </label>
          <input
            id="phone"
            type="text"
            name="phone"   
            value={userData.phone}
            onChange={handleUserDataChange}
            disabled={!isUserDataEditable}
            placeholder="Phone"
          />
        </div>

        <div className="DT-form-group">
          <label htmlFor="zipcode">
            <span className="form-icon">✉️</span> Zipcode
          </label>
          <input
            id="zipcode"
            type="text"
            name="zipcode"   
            value={userData.zipcode}
            onChange={handleUserDataChange}
            disabled={!isUserDataEditable}
            placeholder="Zipcode"
          />
        </div>
        
        <div className='edit'>
          {!isUserDataEditable ? (
          <button onClick={() => setIsUserDataEditable(true)}>Edit User Info</button>
          ) : (
          <div className='edit-buttons'>
            <>  
              <button onClick={handleUserCancel}>Cancel</button>
              <button onClick={handleUserDataSave}>Save</button>
            </>
          </div>
          )}
        </div>  
      </div>

      <div>
        <h3>Business Information</h3>
        <form>
          <div className="DT-form-group">
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

          <div className="DT-form-group">
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

          <div className="DT-form-group">
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

          <div className="DT-form-group">
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

      <Link to="/change-subscription-tier">
          <button>Change Subscription</button>
      </Link>

      <Link to="/cancel-subscription">
          <button>Cancel Subscription</button>
      </Link>
      
    </div>
  );
};

export default UserProfileSettingsPage;
