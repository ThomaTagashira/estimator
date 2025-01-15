import React from 'react';

const UpdatePasswordForm = ({
  newPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  success,
  getStrengthColor,
  getStrengthLabel,
  handlePasswordChange,
  setShowStrength,
  showStrength
}) => {


  return (
    <div>
      <h2>Update Password</h2>
        <form>
          <div className="DT-form-group">
            <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={handlePasswordChange}
                onFocus={() => setShowStrength(true)}
              />
            </div>

            <div className="DT-form-group">
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>  

          <div className="update-form-group">
            {showStrength && (
              <div style={{ color: getStrengthColor(), fontWeight: 'bold', margin: '5px 0' }}>
                Password Strength: {getStrengthLabel()}
              </div>
            )}
          </div>
        </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      
    </div>
  );
};

export default UpdatePasswordForm;
