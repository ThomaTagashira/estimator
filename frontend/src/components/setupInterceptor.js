// src/components/setupInterceptor.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const setupInterceptors = () => {
    axios.interceptors.request.use(
        (config) => {
            const csrfToken = localStorage.getItem('csrftoken'); // Retrieve the CSRF token
            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken;
            }
            const authToken = localStorage.getItem('access_token');
            if (authToken) {
                config.headers['Authorization'] = `Bearer ${authToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response) {
                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    const refreshToken = localStorage.getItem('refresh_token');
                    try {
                        const response = await axios.post(`${apiUrl}/api/token/refresh/`, { refresh: refreshToken });
                        localStorage.setItem('access_token', response.data.access);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        console.error('Error refreshing token', refreshError);
                        // Optionally handle logout or redirect
                    }
                }
            } else {
                console.error('Error without response', error);
            }

            return Promise.reject(error);
        }
    );
};

export default setupInterceptors;
