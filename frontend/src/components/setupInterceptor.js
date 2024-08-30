// setupInterceptors.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const setupInterceptors = () => {
    axios.interceptors.request.use(
        (config) => {
            const csrfToken = localStorage.getItem('csrftoken');
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

            if (error.response && error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                const refreshToken = localStorage.getItem('refresh_token');

                if (refreshToken) {
                    try {
                        const response = await axios.post(`${apiUrl}/api/token/refresh/`, { refresh: refreshToken });
                        localStorage.setItem('access_token', response.data.access);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        console.error('Error refreshing token', refreshError);
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        window.location.href = '/login';
                    }
                } else {
                    console.warn('Refresh token not available, redirecting to login');
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                }
            } else if (!error.response) {
                console.error('Error without response, possibly network issue', error);
            }

            return Promise.reject(error);
        }
    );
};

export default setupInterceptors;
