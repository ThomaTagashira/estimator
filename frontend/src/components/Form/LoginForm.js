import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCookie } from '../utils/getCookies';
import GoogleLoginButton from '../GoogleLoginButton';

const googleID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
// const githubID = process.env.REACT_APP_GITHUB_CLIENT_ID;
const redirUrl = process.env.REACT_APP_REDIR_URL;

const LoginForm = ({ onSubmit, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(''); 

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

    // const handleGitHubLogin = () => {
    //     const authUrl = constructOAuthUrl(
    //         'https://github.com/login/oauth/authorize',
    //         githubID,
    //         `${redirUrl}/github-callback`,
    //         'read:user'
    //     );
    //     window.location.href = authUrl;
    // };

  return (
    <div>
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
        <button type="submit" className="login-btn">Login</button>
      </form>

      {formError && 
        <p style={{ color: 'red' }}>{formError}</p>
      }

      {error && 
        <p style={{ color: 'red' }}>{error}</p>
      }

      <Link to="/register">
        <button className="create-new-account-btn">Create New Account</button>
      </Link>

      <hr className="divider" />

      <div style={{ display: "flex", justifyContent: "center" }}>
        <  GoogleLoginButton googleID={googleID} handleGoogleLogin={handleGoogleLogin} />
      </div>
    </div>
  );
};

export default LoginForm;
