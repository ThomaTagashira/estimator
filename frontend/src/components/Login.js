import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getCookie } from './getCookies';

const apiUrl = process.env.REACT_APP_API_URL;
const redirUrl = process.env.REACT_APP_REDIR_URL;
const googleID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const githubID = process.env.REACT_APP_GITHUB_CLIENT_ID;

const Login = ({ setIsAuthenticated, setHasActiveSubscription }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Memoize the validateAndFetchSubscriptionStatus function using useCallback
    const validateAndFetchSubscriptionStatus = useCallback(async () => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!accessToken) {
            console.error('No access token available');
            setIsAuthenticated(false);
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get(`${apiUrl}/api/subscription/status/`);
            setHasActiveSubscription(response.data.has_active_subscription);
            navigate('/');
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            setHasActiveSubscription(false);

            if (error.response && error.response.status === 401) {
                if (refreshToken) {
                    try {
                        const refreshResponse = await axios.post(`${apiUrl}/api/token/refresh/`, { refresh: refreshToken });
                        const newAccessToken = refreshResponse.data.access;

                        // Update the access token in local storage and Axios headers
                        localStorage.setItem('access_token', newAccessToken);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                        await validateAndFetchSubscriptionStatus(); // Retry fetching subscription status
                    } catch (refreshError) {
                        console.error('Error refreshing token:', refreshError);
                        setIsAuthenticated(false);
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        navigate('/login');
                    }
                } else {
                    setIsAuthenticated(false);
                    navigate('/login');
                }
            }
        }
    }, [setIsAuthenticated, setHasActiveSubscription, navigate]);

    useEffect(() => {
        validateAndFetchSubscriptionStatus();
    }, [validateAndFetchSubscriptionStatus]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const csrftoken = getCookie('csrftoken');

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

            // Debugging: Log the tokens being set
            console.log('Access token after login:', access);
            console.log('Refresh token after login:', refresh);

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
            setError('Invalid credentials');
        }
    };

    const handleGoogleLogin = () => {
        const clientId = googleID;
        const redirectUri = `${redirUrl}/google-callback`;
        const scope = 'profile email';
        const responseType = 'code';

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

        window.location.href = authUrl;
    };

    const handleGitHubLogin = () => {
        const clientId = githubID;
        const redirectUri = `${redirUrl}/github-callback`;

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user`;

        window.location.href = authUrl;
    };

    return (
        <div>
            <h2>Greetings Humans(?)</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login using Username</button>
            </form>
            {error && <p>{error}</p>}
            <p>Don't have an account? <Link to="/register">Register</Link></p>

            <GoogleOAuthProvider clientId={googleID}>
                <button onClick={handleGoogleLogin}>Login with Google</button>
            </GoogleOAuthProvider>

            <button onClick={handleGitHubLogin}>Login with GitHub</button>
        </div>
    );
};

export default Login;
