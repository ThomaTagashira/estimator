// pages/RegisterPage.js
import React from 'react';
import RegisterForm from '../components/Form/RegisterForm';
import useRegister from '../hooks/useRegister';

const RegisterPage = () => {
    const {
        username,
        setUsername,
        password,
        setPassword,
        error,
        register,
    } = useRegister();

    return (
        <RegisterForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            error={error}
            onSubmit={register}
        />
    );
};

export default RegisterPage;
