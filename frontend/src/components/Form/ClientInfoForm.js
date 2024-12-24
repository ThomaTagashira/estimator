import React from 'react';
import '../components_css/Components.css';

const ClientInfoForm = ({
  clientInfo,
  handleClientInfoChange,
  handleNext,
  handleCancel,
}) => {

  
  return (
    <div>
      <form>
        <div className="form-group">
          <label htmlFor="clientName">
            <span className="form-icon">👤</span> Client Name
          </label>
          <input
            id="clientName"
            type="text"
            name="clientName"
            value={clientInfo.clientName}
            onChange={handleClientInfoChange}
            placeholder="Enter client's name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="clientAddress">
            <span className="form-icon">📍</span> Client Address
          </label>
          <input
            id="clientAddress"
            type="text"
            name="clientAddress"
            value={clientInfo.clientAddress}
            onChange={handleClientInfoChange}
            placeholder="Enter client's address"
          />
        </div>
        <div className="form-group">
          <label htmlFor="clientPhone">
            <span className="form-icon">📞</span> Client Phone
          </label>
          <input
            id="clientPhone"
            type="text"
            name="clientPhone"
            value={clientInfo.clientPhone}
            onChange={handleClientInfoChange}
            placeholder="Enter client's phone number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="clientEmail">
            <span className="form-icon">✉️</span> Client Email
          </label>
          <input
            id="clientEmail"
            type="email"
            name="clientEmail"
            value={clientInfo.clientEmail}
            onChange={handleClientInfoChange}
            placeholder="Enter client's email"
          />
        </div>
        <div className="button-group">
          <button type='button' className='next-btn' onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="next-btn" onClick={handleNext}>
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientInfoForm;
