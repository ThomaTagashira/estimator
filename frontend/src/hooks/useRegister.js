// hooks/useRegister.js
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const useRegister = () => {
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate(`/`);
    };

const register = async (email, password, csrftoken) => {
    try {
        const response = await axios.post(`${apiUrl}/api/register/`, {
            userEmail: email,
            password,
        }, {
            headers: {
                'X-CSRFToken': csrftoken,
            },
        });

        const { access, refresh } = response.data;


        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

        if (response.data.has_active_subscription) {
            navigate('/dashboard');
        } else {
            navigate('/subscribe');
        }
    } catch (err) {
        setError('Error during registration. Please try again.'+err.message);
    }
};

    return {
        userEmail,
        setUserEmail,
        password,
        setPassword,
        error,
        register,
        handleCancel
    };
};

export default useRegister;
