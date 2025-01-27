import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; 

const GoogleCallback = ({ setIsAuthenticated, setHasActiveSubscription, setInTrial, setIsAccountOAuth }) => {
  const navigate = useNavigate();

  const { loginWithGoogle } = useAuth({ setIsAuthenticated, setHasActiveSubscription, setInTrial, setIsAccountOAuth });

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');

    if (code) {
      loginWithGoogle(code); 
    } else {
      navigate('/login'); 
    }
  }, [loginWithGoogle, navigate]);

  return (
    <div>
      <h2>Processing Google Login...</h2>
    </div>
  );
};

export default GoogleCallback;
