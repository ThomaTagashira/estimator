import React from 'react';
import '../components_css/Components.css';

const UserInfoForm = ({
  userData,
  handleUserDataChange,
  handleNext,
  handleCancel,
}) => {

  
  return (
      <form>
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
            placeholder="Zipcode"
          />
        </div>

        <div className="button-group">
          <button type='button' className='upload-btn' onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="upload-btn" onClick={handleNext}>
            Next
          </button>
        </div>
      </form>
  );
};

export default UserInfoForm;
