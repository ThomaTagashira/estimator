// GoogleCallback.js

import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const GoogleCallback = ({ setIsAuthenticated, setHasActiveSubscription }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');

        if (code) {
            axios.post(`${apiUrl}/api/auth/google/`, { code })
                .then(response => {
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
                })
                .catch(error => {
                    console.error('Error exchanging Google code:', error);
                    navigate('/login');
                });
        } else {
            navigate('/login');
        }
    }, [setIsAuthenticated, setHasActiveSubscription, navigate]);

    return (
        <div>
            <h2>Processing Google Login...</h2>
        </div>
    );
};

export default GoogleCallback;
