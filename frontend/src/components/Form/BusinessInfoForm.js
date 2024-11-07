import React from 'react';

const BusinessInfoForm = ({ businessInfo, handleBusinessInfoChange, handleBusinessSubmit }) => {
  return (
    <div className="business-info">
      <h3>Business Information</h3>
      <div>
        <input
          type="text"
          name="businessName"
          value={businessInfo.businessName}
          onChange={handleBusinessInfoChange}
          placeholder="Enter Your Business Name"
        />
      </div>
      <div>
        <input
          type="text"
          name="businessAddress"
          value={businessInfo.businessAddress}
          onChange={handleBusinessInfoChange}
          placeholder="Enter Your Business Address"
        />
      </div>
      <div>
        <input
          type="text"
          name="businessPhone"
          value={businessInfo.businessPhone}
          onChange={handleBusinessInfoChange}
          placeholder="Enter Your Business Phone Number"
        />
      </div>
      <div>
        <input
          type="text"
          name="businessEmail"
          value={businessInfo.businessEmail}
          onChange={handleBusinessInfoChange}
          placeholder="Enter Your Business Email"
        />
      </div>
      <button onClick={handleBusinessSubmit}>Save Business Information</button>
    </div>
  );
};

export default BusinessInfoForm;