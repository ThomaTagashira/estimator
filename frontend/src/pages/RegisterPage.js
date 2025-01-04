import React from 'react';
import RegisterForm from '../components/Form/RegisterForm';
import useRegister from '../hooks/useRegister';
import './pages_css/Pages.css'; 

const RegisterPage = () => {
    const {
        userEmail,
        setUserEmail,
        password,
        setPassword,
        error,
        register,
        handleCancel
    } = useRegister({

        setIsAuthenticated: () => {}, 
        setHasActiveSubscription: () => {}, 
    });

    return (
        <div className='page'>
            <div className='login-container'>
                <RegisterForm
                    userEmail={userEmail}
                    setUserEmail={setUserEmail}
                    password={password}
                    setPassword={setPassword}
                    error={error}
                    register={register}
                    handleCancel={handleCancel}
                />
            </div>
        </div>
    );
};

export default RegisterPage;
