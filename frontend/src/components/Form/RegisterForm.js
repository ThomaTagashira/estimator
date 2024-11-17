// components/RegisterForm.js
import React from 'react';

const RegisterForm = ({ username, setUsername, password, setPassword, error, onSubmit }) => {
    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={onSubmit}>
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
                <button type="submit">Register</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default RegisterForm;
