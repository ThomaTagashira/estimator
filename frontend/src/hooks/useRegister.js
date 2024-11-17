// hooks/useRegister.js
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const useRegister = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const register = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${apiUrl}/api/register/`, {
                username,
                password,
            });
            navigate('/');
        } catch (err) {
            setError('Error creating account: ' + err.message);
        }
    };

    return {
        username,
        setUsername,
        password,
        setPassword,
        error,
        register,
    };
};

export default useRegister;
