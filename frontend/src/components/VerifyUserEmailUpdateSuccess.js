import { useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import React from 'react';
import LoginForm from '../components/Form/LoginForm';

const VerifyUserEmailUpdateSuccess = ({ setIsAuthenticated, setHasActiveSubscription, setInTrial, setAuthIsLoading }) => {
    const { login, error } = useAuth({ setIsAuthenticated, setHasActiveSubscription, setInTrial, setAuthIsLoading });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const email = searchParams.get('email');
  const success = searchParams.get('success')?.toLowerCase() === 'true';

  console.log('email: ', email)
  console.log('success: ', success)


  return (
    <div className='page'>
      {success ? (
        <>
          <h1>Email Updated Successfully!</h1>
          <p>
            Your email <strong>{email}</strong> has been updated. Please login with your new email to continue.
            <div className='login-container'>
                <LoginForm onSubmit={login} error={error} />
            </div>
          </p>
        </>
      ) : (
        <>
          <h1>Email Update Failed</h1>
          <p>
            There was an issue updating your email. Please try again.
          </p>
        </>
      )}
    </div>
  );
};

export default VerifyUserEmailUpdateSuccess;
