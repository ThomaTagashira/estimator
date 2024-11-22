import React, { useState } from 'react';
import { getCookie } from '../utils/getCookies';

const RegisterForm = ({ 
    userEmail,
    setUserEmail,
    password,
    setPassword,
    error,
    register,
}) => {
    const handleSubmit = (e) => {
        e.preventDefault(); 
        register(userEmail, password, getCookie('csrftoken')); 
    };

    const [passwordStrength, setPasswordStrength] = useState(0);

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
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="userEmail"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Email Address"
                />
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Password"

                />
                <div style={{ color: getStrengthColor(), fontWeight: 'bold', margin: '5px 0' }}>
                    Password Strength: {getStrengthLabel()}
                </div>
                <button type="submit">Register</button> 
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default RegisterForm;
