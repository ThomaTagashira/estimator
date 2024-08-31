import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 1;

const setupInterceptors = () => {
    axios.interceptors.request.use(
        (config) => {
            const authToken = localStorage.getItem('access_token');
            if (authToken) {
                config.headers['Authorization'] = `Bearer ${authToken}`;
            }
            console.log('Request Config:', config);
            return config;
        },
        (error) => {
            console.error('Error in request interceptor:', error);
            return Promise.reject(error);
        }
    );

    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            console.log('Error Response:', error.response);

            if (error.response && error.response.status === 401 && !originalRequest._retry && refreshAttempts < MAX_REFRESH_ATTEMPTS) {
                console.log('401 error detected, attempting token refresh...');
                originalRequest._retry = true;
                refreshAttempts += 1;
                const refreshToken = localStorage.getItem('refresh_token');

                if (refreshToken) {
                    console.log('Refresh token found, attempting to refresh access token...');
                    try {
                        const response = await axios.post(`${apiUrl}/api/token/refresh/`, {
                            refresh: refreshToken
                        });

                        console.log('Token refresh response:', response);

                        const newAccessToken = response.data.access;

                        if (newAccessToken) {
                            console.log('Received new access token:', newAccessToken);

                            localStorage.setItem('access_token', newAccessToken);
                            axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                            console.log('Token refresh successful, retrying original request...');
                            refreshAttempts = 0;
                            return axios(originalRequest);
                        } else {
                            console.warn('No access token received, redirecting to login');
                            throw new Error('No access token received');
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing token:', refreshError);
                        console.log('Removing tokens and redirecting to login due to refresh failure');
                        refreshAttempts = 0;
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        window.location.href = '/login';
                    }
                } else {
                    console.warn('Refresh token not available, removing tokens and redirecting to login');
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            } else {
                console.warn('Max refresh attempts reached or other 401 error, removing tokens and redirecting to login');
                refreshAttempts = 0;
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }

            return Promise.reject(error);
        }
    );
};

export default setupInterceptors;
