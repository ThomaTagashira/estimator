import React from 'react';

const ClientInfoForm = ({
    clientInfo,
    handleClientInfoChange,
    handleNext
}) => {

  return (
    <div className="client-info">
      <h3>Client Information</h3>
      <div>
        <input
          type="text"
          name="clientName"
          value={clientInfo.clientName}
          onChange={handleClientInfoChange}
          placeholder="Client Name"
        />
      </div>
      <div>
        <input
          type="text"
          name="clientAddress"
          value={clientInfo.clientAddress}
          onChange={handleClientInfoChange}
          placeholder="Client Address"
        />
      </div>
      <div>
        <input
          type="text"
          name="clientPhone"
          value={clientInfo.clientPhone}
          onChange={handleClientInfoChange}
          placeholder="Client Phone"
        />
      </div>
      <div>
        <input
          type="text"
          name="clientEmail"
          value={clientInfo.clientEmail}
          onChange={handleClientInfoChange}
          placeholder="Client Email"
        />
      </div>
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default ClientInfoForm;
