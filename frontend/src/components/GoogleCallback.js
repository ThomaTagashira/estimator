import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCookie } from './getCookies';

const apiUrl = process.env.REACT_APP_API_URL;

const GoogleCallback = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log('Google authorization code:', code);

        if (code) {
            const csrftoken = getCookie('csrftoken');
            const code = urlParams.get('code');
            console.log('Google authorization code:', code);
            axios.post(`${apiUrl}/api/auth/google/`, {
                code: code,
            }, {
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                const { access_token } = response.data;

                // Store tokens securely
                localStorage.setItem('access_token', access_token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

                setIsAuthenticated(true);
                navigate('/');  // Redirect to the home page on success
            })
            .catch(error => {
                console.error('Error exchanging Google code:', error);
                navigate('/subscribe');
            });
        } else {
            console.error('Google authorization code not found in the URL');
            // Optionally, redirect to login or show an error message
            navigate('/login'); // Redirect back to login if no code is found
        }
    }, [navigate, setIsAuthenticated]);

    return <div>Loading...</div>;
};

export default GoogleCallback;
