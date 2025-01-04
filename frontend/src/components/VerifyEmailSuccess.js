import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const VerifyEmailSuccess = ({ setIsAuthenticated, setHasActiveSubscription, setInTrial }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const email = searchParams.get('email');
  const accessToken = searchParams.get('access');
  const refreshToken = searchParams.get('refresh');
  const hasActiveSubscription = searchParams.get('has_active_subscription') === 'true';
  const inTrial = searchParams.get('in_trial') === 'true';

  useEffect(() => {
    if (accessToken && refreshToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      setIsAuthenticated(true);
      setHasActiveSubscription(hasActiveSubscription);
      setInTrial(inTrial);


      const timer = setTimeout(() => {
        navigate('/');
      }, 5000); 

      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
  }, [
    accessToken,
    refreshToken,
    hasActiveSubscription,
    inTrial,
    navigate,
    setIsAuthenticated,
    setHasActiveSubscription,
    setInTrial,
  ]);

  return (
    <div>
      <h1>Email Verified Successfully!</h1>
      <p>
        Your email <strong>{email}</strong> has been verified. You will be redirected shortly.
      </p>
      <p>
        If you are not automatically redirected, please{' '}
        <a href="https://fairbuildapp.com">click here</a>.
      </p>
    </div>
  );
};

export default VerifyEmailSuccess;
