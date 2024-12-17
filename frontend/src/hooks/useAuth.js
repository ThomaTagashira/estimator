import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const useAuth = ({ setIsAuthenticated, setHasActiveSubscription }) => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
                const response = await axios.get(`${apiUrl}/api/subscription/status/`);
                setHasActiveSubscription(response.data.has_active_subscription);
                navigate('/'); 
            } catch (error) {
                setHasActiveSubscription(false);

                if (error.response && error.response.status === 401 && refreshToken) {
                    try {
                        const refreshResponse = await axios.post(`${apiUrl}/api/token/refresh/`, { refresh: refreshToken });
                        const newAccessToken = refreshResponse.data.access;

                        localStorage.setItem('access_token', newAccessToken);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                        await validateAndFetchSubscriptionStatus();
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
    }, [setIsAuthenticated, setHasActiveSubscription, navigate]);

    useEffect(() => {
        validateAndFetchSubscriptionStatus(); 
    }, [validateAndFetchSubscriptionStatus]);

    const login = async (username, password, csrftoken) => {
        try {
            const response = await axios.post(`${apiUrl}/api/userToken/`, {
                username,
                password,
            }, {
                headers: {
                    'X-CSRFToken': csrftoken
                }
            });

            const { access, refresh, has_active_subscription } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            setIsAuthenticated(true);
            setHasActiveSubscription(has_active_subscription);

            if (has_active_subscription) {
                navigate('/'); 
            } else {
                navigate('/subscribe'); 
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Subscription required. Please subscribe.');
                navigate('/subscribe');
            } else {
                setError('Invalid credentials. Please try again.');
            }
        }
    };

    return { login, error };
};

export default useAuth;
