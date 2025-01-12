import React from 'react';
import useAuth from '../hooks/useAuth';
import LoginForm from '../components/Form/LoginForm';
import './pages_css/Pages.css';

const LoginPage = ({ setIsAuthenticated, setHasActiveSubscription, setInTrial }) => {
    const { login, error } = useAuth({ setIsAuthenticated, setHasActiveSubscription, setInTrial  });

    return (
        <div className='page'>
            <div className='login-container'>
                <LoginForm onSubmit={login} error={error} />
            </div>
        </div>
    );
};

export default LoginPage;