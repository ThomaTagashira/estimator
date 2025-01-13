import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const useAuth = ({ setIsAuthenticated, setHasActiveSubscription, setInTrial, setAuthIsLoading }) => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchUserState = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/auth/user-state`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const { is_active, in_trial, profile_completed } = response.data;

      setIsAuthenticated(profile_completed);
      setHasActiveSubscription(is_active);
      setInTrial(in_trial);
      setAuthIsLoading(false);

      localStorage.setItem('isAuthenticated', profile_completed);
      localStorage.setItem('hasActiveSubscription', is_active);
      localStorage.setItem('inTrial', in_trial);
    } catch (error) {
      console.error('Failed to fetch user state:', error);
      setIsAuthenticated(false);
      setHasActiveSubscription(false);
      setInTrial(false);
      setAuthIsLoading(false);
    }
  }, [setIsAuthenticated, setHasActiveSubscription, setInTrial, setAuthIsLoading]);

  const validateAndFetchSubscriptionStatus = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken) {
      console.log('No access token');
      setIsAuthenticated(false);
      setAuthIsLoading(false);
      navigate('/login');
      return;
    }

    try {
      await fetchUserState();
    } catch (error) {
      if (error.response?.status === 401 && refreshToken) {
        try {
          const refreshResponse = await axios.post(`${apiUrl}/api/token/refresh/`, { refresh: refreshToken });
          const newAccessToken = refreshResponse.data.access;

          localStorage.setItem('access_token', newAccessToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          await fetchUserState();
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          setIsAuthenticated(false);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        }
      } else {
        console.error('Error fetching subscription status:', error);
        setIsAuthenticated(false);
        navigate('/login');
      }
    }
  }, [fetchUserState, setIsAuthenticated, setAuthIsLoading, navigate]);

  const login = async (username, password, csrftoken) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/userToken/`,
        { username, password },
        { headers: { 'X-CSRFToken': csrftoken } }
      );

      const { access, refresh, has_active_subscription, profile_completed } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setIsAuthenticated(profile_completed);
      setHasActiveSubscription(has_active_subscription);

      if (has_active_subscription) {
        if (profile_completed) {
          navigate('/');
        } else {
          navigate('/complete-login');
        }
      } else {
        navigate('/subscribe');
      }

      await fetchUserState();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please try again.');
      } else if (err.response?.status === 403) {
        setError('Subscription required. Please subscribe.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  const loginWithGoogle = async (code) => {
    try {
      const response = await axios.post(`${apiUrl}/api/auth/google/`, { code });

      const { access, refresh, has_active_subscription, profile_completed, in_trial } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setIsAuthenticated(profile_completed);
      setHasActiveSubscription(has_active_subscription);
      setInTrial(in_trial);

      if (!has_active_subscription) {
        navigate('/subscribe');
      } else if (!profile_completed) {
        navigate('/complete-login');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error during Google OAuth login:', error);
      navigate('/login'); 
    }
  };

  return { login, loginWithGoogle, error, validateAndFetchSubscriptionStatus };
};

export default useAuth;
