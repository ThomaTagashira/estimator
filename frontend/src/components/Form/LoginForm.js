import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getCookie } from '../utils/getCookies';

const googleID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const githubID = process.env.REACT_APP_GITHUB_CLIENT_ID;
const redirUrl = process.env.REACT_APP_REDIR_URL;

const LoginForm = ({ onSubmit, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const csrftoken = getCookie('csrftoken');
        onSubmit(username, password, csrftoken);
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

export default LoginForm;
