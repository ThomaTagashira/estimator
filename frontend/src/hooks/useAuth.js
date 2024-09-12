import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const useAuth = ({ setIsAuthenticated, setHasActiveSubscription }) => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateAndFetchSubscriptionStatus = useCallback(async () => {
        let isFetching = false;  // Local variable to control fetching

        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!accessToken) {
            setIsAuthenticated(false);
            navigate('/'); // Redirect to login if no access token
            return;
        }

        if (!isFetching) {
            isFetching = true;
            try {
                const response = await axios.get(`${apiUrl}/api/subscription/status/`);
                setHasActiveSubscription(response.data.has_active_subscription);
                navigate('/'); // Redirect to home page if the subscription is valid
            } catch (error) {
                setHasActiveSubscription(false);

                if (error.response && error.response.status === 401 && refreshToken) {
                    try {
                        const refreshResponse = await axios.post(`${apiUrl}/api/token/refresh/`, { refresh: refreshToken });
                        const newAccessToken = refreshResponse.data.access;

                        localStorage.setItem('access_token', newAccessToken);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                        // Retry fetching the subscription status after refreshing the token
                        await validateAndFetchSubscriptionStatus();
                    } catch (refreshError) {
                        setIsAuthenticated(false);
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        navigate('/'); // Redirect to login if token refresh fails
                    }
                } else {
                    setIsAuthenticated(false);
                    navigate('/'); // Redirect if the error is not token-related
                }
            }
        }
    }, [setIsAuthenticated, setHasActiveSubscription, navigate]);

    useEffect(() => {
        validateAndFetchSubscriptionStatus(); // Call once when component mounts
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
                navigate('/'); // Redirect to home page after successful login
            } else {
                navigate('/subscribe'); // Redirect to subscription page
            }
        } catch (err) {
            setError('Invalid credentials'); // Set error state if login fails
        }
    };

    return { login, error };
};

export default useAuth;
