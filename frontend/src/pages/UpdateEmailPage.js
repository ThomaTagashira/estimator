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
    loading
  } = useUpdateEmail(apiUrl);

    

  return (
    <div className='page'>
      <div className='login-container'>
        <UpdateEmailForm
          newEmail={newEmail} 
          setNewEmail={setNewEmail}
          confirmEmail={confirmEmail}
          setConfirmEmail={setConfirmEmail}
          error={error}
          success={success}
          />

        <button onClick={handleEmailUpdate} disabled={loading}>
          Update Email
        </button>
      </div>
    </div>
  );
};

export default UpdateEmailPage;