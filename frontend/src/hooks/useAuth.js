import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const useAuth = ({ setIsAuthenticated, setHasActiveSubscription, setInTrial }) => {
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

        console.log('Response data:', response.data);

        setIsAuthenticated(profile_completed);
        setHasActiveSubscription(is_active);
        setInTrial(in_trial);

        console.log('isAuthenticated set to:', profile_completed);
    } catch (error) {
        console.error('Failed to fetch user state:', error);
        setIsAuthenticated(false);
    }
    }, [setIsAuthenticated, setHasActiveSubscription, setInTrial]);

    const validateAndFetchSubscriptionStatus = useCallback(async () => {
        let isFetching = false;

        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!accessToken) {
            setIsAuthenticated(false);
            navigate('/');
            return;
        }

        if (!isFetching) {
            isFetching = true;
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
                        setIsAuthenticated(false);
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        navigate('/');
                    }
                } else {
                    setIsAuthenticated(false);
                    navigate('/');
                }
            }
        }
    }, [fetchUserState, setIsAuthenticated, navigate]);

    useEffect(() => {
        validateAndFetchSubscriptionStatus(); 
    }, [validateAndFetchSubscriptionStatus]);

    const login = async (username, password, csrftoken) => {
        try {
          const response = await axios.post(
            `${apiUrl}/api/userToken/`,
            { username, password },
            {
              headers: {
                'X-CSRFToken': csrftoken,
              },
            }
          );
      
          const { access, refresh, has_active_subscription, profile_completed } = response.data; 
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
          setIsAuthenticated(true);
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
      
      return { login, error };
      
};

export default useAuth;
