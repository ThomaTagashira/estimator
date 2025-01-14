import React from 'react';
import UpdatePasswordForm from '../components/Form/UpdatePasswordForm';
import useUpdatePassword from '../hooks/useUpdatePassword';

const UpdatePasswordPage = ({apiUrl}) => {

  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    handlePasswordUpdate,
    loading,
    getStrengthColor,
    getStrengthLabel,
    handlePasswordChange,
    setShowStrength,
    showStrength,
    handleCancel
  } = useUpdatePassword(apiUrl);

    

  return (
    <div className='page'>
      <div className='login-container'>
        <UpdatePasswordForm
          newPassword={newPassword} 
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          error={error}
          success={success}
          getStrengthColor={getStrengthColor}
          getStrengthLabel={getStrengthLabel}
          handlePasswordChange={handlePasswordChange}
          setShowStrength={setShowStrength}
          showStrength={showStrength}
          />

        <button onClick={handleCancel} disabled={loading}>
          Cancel
        </button>

        <button onClick={handlePasswordUpdate} disabled={loading}>
          Update Password
        </button>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;