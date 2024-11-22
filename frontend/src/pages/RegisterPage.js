import React from 'react';
import RegisterForm from '../components/Form/RegisterForm';
import useRegister from '../hooks/useRegister';

const RegisterPage = () => {
    const {
        userEmail,
        setUserEmail,
        password,
        setPassword,
        error,
        register,
    } = useRegister({
        setIsAuthenticated: () => {}, 
        setHasActiveSubscription: () => {}, 
    });

    return (
        <RegisterForm
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            password={password}
            setPassword={setPassword}
            error={error}
            register={register}
        />
    );
};

export default RegisterPage;
