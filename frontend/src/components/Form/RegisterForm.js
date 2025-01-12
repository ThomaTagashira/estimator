import React, { useState } from 'react';
import { getCookie } from '../utils/getCookies';
import '../components_css/Components.css';
import GoogleLoginButton from '../GoogleLoginButton';

const googleID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const redirUrl = process.env.REACT_APP_REDIR_URL;

const RegisterForm = ({ 
	userEmail,
	setUserEmail,
	password,
	setPassword,
	error,
	register,
	handleCancel
}) => {

	const [confirmPassword, setConfirmPassword] = useState(''); 
	const [passwordStrength, setPasswordStrength] = useState(0);
	const [showStrength, setShowStrength] = useState(false);
	const [passwordError, setPasswordError] = useState(''); 

const handleSubmit = (e) => {
	e.preventDefault(); 
	if (password !== confirmPassword) {
		setPasswordError('Passwords do not match');
		return;
	}

	setPasswordError(''); 
	register(userEmail, password, getCookie('csrftoken')); 
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

const calculatePasswordStrength = (password) => {
	let score = 0;
	if (password.length >= 8) score += 1; 
	if (/[A-Z]/.test(password)) score += 1;
	if (/[a-z]/.test(password)) score += 1;
	if (/[0-9]/.test(password)) score += 1; 
	if (/[\W_]/.test(password)) score += 1;
	return score;
};

const handlePasswordChange = (e) => {
	const newPassword = e.target.value;
	setPassword(newPassword);
	const strength = calculatePasswordStrength(newPassword);
	setPasswordStrength(strength);
};

const getStrengthLabel = () => {
	switch (passwordStrength) {
		case 0:
		case 1:
			return 'Weak';
		case 2:
			return 'Fair';
		case 3:
			return 'Good';
		case 4:
		case 5:
			return 'Strong';
		default:
			return '';
	}
};

const getStrengthColor = () => {
	switch (passwordStrength) {
		case 0:
		case 1:
			return 'red';
		case 2:
			return 'orange';
		case 3:
			return 'yellow';
		case 4:
		case 5:
			return 'green';
		default:
			return '';
	}
};


	return (
		<div>
			<h2>Create Account</h2>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					name="userEmail"
					value={userEmail}
					onChange={(e) => setUserEmail(e.target.value)}
					placeholder="Email"
				/>

				<input
					type="password"
					name="password"
					value={password}
					onChange={handlePasswordChange}
					placeholder="Password"
					onFocus={() => setShowStrength(true)}
					// onBlur={() => setShowStrength(false)}
				/>

				<input
					type="password"
					name="confirmPassword"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					placeholder="Confirm Password"
				/>

				{showStrength && (
					<div style={{ color: getStrengthColor(), fontWeight: 'bold', margin: '5px 0' }}>
						Password Strength: {getStrengthLabel()}
					</div>
				)}

				{/* Show error if passwords don't match */}
				{passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}

					<button type="submit" className="login-btn">
						<strong>Register</strong>
					</button>

					<button type='button' className='create-new-account-btn' onClick={handleCancel}>
						<strong>Cancel</strong>					
					</button>

				<hr className='divider'/>

				<div style={{ display: "flex", justifyContent: "center"}}>
					<  GoogleLoginButton googleID={googleID} handleGoogleLogin={handleGoogleLogin} />
				</div>
			</form>
			{error && <p>{error}</p>}
		</div>
	);
};

export default RegisterForm;
