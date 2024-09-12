import React from 'react';
import useAuth from '../hooks/useAuth'; // Assuming you place the hook in a hooks folder
import LoginForm from '../components/Form/LoginForm';

const LoginPage = ({ setIsAuthenticated, setHasActiveSubscription }) => {
    const { login, error } = useAuth({ setIsAuthenticated, setHasActiveSubscription });

    return (
        <div>
            <LoginForm onSubmit={login} error={error} />
        </div>
    );
};

export default LoginPage;
