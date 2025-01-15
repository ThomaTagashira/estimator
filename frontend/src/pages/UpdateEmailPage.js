import React from 'react';
import UpdateEmailForm from '../components/Form/UpdateEmailForm';
import useUpdateEmail from '../hooks/useUpdateEmail';

const UpdateEmailPage = ({apiUrl}) => {

  const {
    newEmail,
    setNewEmail,
    confirmEmail,
    setConfirmEmail,
    error,
    success,
    handleEmailUpdate,
    loading,
    handleCancel
  } = useUpdateEmail(apiUrl);

    

  return (
    <div className='page'>
      <div className='update-info-container'>
        <UpdateEmailForm
          newEmail={newEmail} 
          setNewEmail={setNewEmail}
          confirmEmail={confirmEmail}
          setConfirmEmail={setConfirmEmail}
          error={error}
          success={success}
          />

        <div className='edit'>
          <div className='edit-buttons'>
            <button onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
            <button onClick={handleEmailUpdate} disabled={loading}>
              Update Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateEmailPage;