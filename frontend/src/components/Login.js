import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getCookie } from './getCookies';

const apiUrl = process.env.REACT_APP_API_URL;
const redirUrl = process.env.REACT_APP_REDIR_URL;
const googleID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const githubID = process.env.REACT_APP_GITHUB_CLIENT_ID;



const Login = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is already authenticated
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            setIsAuthenticated(true);
            navigate('/');  // Redirect to home if already authenticated
        }
    }, [setIsAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const csrftoken = getCookie('csrftoken');
        try {
            const response = await axios.post(`${apiUrl}/api/token/`, {
                username,
                password,
            }, {
                headers: {
                    'X-CSRFToken': csrftoken
                }
            });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
            setIsAuthenticated(true);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    const handleGoogleLogin = () => {
        const clientId = `${googleID}`;
        const redirectUri = `${redirUrl}/google-callback`;
        const scope = 'profile email';
        const responseType = 'code';

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

        window.location.href = authUrl;  // **Google OAuth
    };

    const handleGitHubLogin = () => {
        const clientId = `${githubID}`;
        const redirectUri = `${redirUrl}/github-callback`;

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user`;

        window.location.href = authUrl;  // **Github OAuth
    };

    return (
        <div>
            <h2>Login</h2>
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
                <button type="submit">Login</button>
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