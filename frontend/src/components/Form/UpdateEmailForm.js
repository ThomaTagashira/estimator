import React from 'react';

const UpdateEmailForm = ({
  newEmail,
  setNewEmail,
  confirmEmail,
  setConfirmEmail,
  error,
  success
}) => {

  return (
    <div>
      <h2>Update Email</h2>
        <form>
          <div className="DT-form-group">
            <input
              type="email"
              placeholder="Enter new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>  

          <div className="update-form-group">
            <input
              type="email"
              placeholder="Confirm new email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </div>
        </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      
    </div>
  );
};

export default UpdateEmailForm;
