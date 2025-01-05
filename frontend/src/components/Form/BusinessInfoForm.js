import React from 'react';
import '../components_css/Components.css';

const BusinessInfoForm = ({
  businessInfo,
  handleBusinessInfoChange,
  handlePrevious,
  handleLoginCompleteSubmit
}) => {

  
  return (
    <div>
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
            placeholder="Enter Your Business Email"
          />
        </div>

        <div className="button-group">
          <button type="button" className="upload-btn" onClick={handlePrevious}>
            Previous
          </button>
          <button type="button" className="upload-btn" onClick={handleLoginCompleteSubmit}>
            Complete
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessInfoForm;