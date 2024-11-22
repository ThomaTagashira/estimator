import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getCookie } from '../utils/getCookies';

const googleID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const githubID = process.env.REACT_APP_GITHUB_CLIENT_ID;
const redirUrl = process.env.REACT_APP_REDIR_URL;

const LoginForm = ({ onSubmit, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError(''); // Clear previous errors

        if (!email) {
            setFormError('Email is required.');
            return;
        }
        if (!password) {
            setFormError('Password is required.');
            return;
        }

        const csrftoken = getCookie('csrftoken');
        onSubmit(email, password, csrftoken);
    };

    const constructOAuthUrl = (baseUrl, clientId, redirectUri, scope, responseType = 'code') => {
        return `${baseUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
    };

    const handleGoogleLogin = () => {
        const authUrl = constructOAuthUrl(
            'https://accounts.google.com/o/oauth2/v2/auth',
            googleID,
            `${redirUrl}/google-callback`,
            'profile email'
        );
        window.location.href = authUrl;
    };

    const handleGitHubLogin = () => {
        const authUrl = constructOAuthUrl(
            'https://github.com/login/oauth/authorize',
            githubID,
            `${redirUrl}/github-callback`,
            'read:user'
        );
        window.location.href = authUrl;
    };

    return (
        <div>
            <h2>Greetings Humans(?)</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <p>Don't have an account? <Link to="/register">Register</Link></p>

            <GoogleOAuthProvider clientId={googleID}>
                <button onClick={handleGoogleLogin}>Login with Google</button>
            </GoogleOAuthProvider>

            <button onClick={handleGitHubLogin}>Login with GitHub</button>
        </div>
    );
};

export default LoginForm;
