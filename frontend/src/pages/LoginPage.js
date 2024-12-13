import React from 'react';
import useAuth from '../hooks/useAuth';
import LoginForm from '../components/Form/LoginForm';
import './pages_css/Pages.css';

const LoginPage = ({ setIsAuthenticated, setHasActiveSubscription }) => {
    const { login, error } = useAuth({ setIsAuthenticated, setHasActiveSubscription });

    return (
        <div className='login-container'>
            <LoginForm onSubmit={login} error={error} />
        </div>
    );
};

export default LoginPage;