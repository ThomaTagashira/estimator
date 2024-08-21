import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCookie } from './getCookies';

const apiUrl = process.env.REACT_APP_API_URL;

const GitHubCallback = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            const csrftoken = getCookie('csrftoken');
            axios.post(`${apiUrl}/api/auth/github/`, {
                code: code,
            }, {
                headers: {
                    'X-CSRFToken': csrftoken
                }
            }).then(response => {
                localStorage.setItem('access_token', response.data.access_token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
                setIsAuthenticated(true);
                navigate('/');
            }).catch(error => {
                console.error('Error exchanging GitHub code:', error);
            });
        } else {
            console.error('GitHub authorization code not found in the URL');
        }
    }, [navigate, setIsAuthenticated]);

    return <div>Loading...</div>;
};

export default GitHubCallback;