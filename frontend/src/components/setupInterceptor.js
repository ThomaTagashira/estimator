import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const setupInterceptors = () => {
    axios.interceptors.request.use(
        (config) => {
            const accessToken = localStorage.getItem('access_token');
            if (accessToken) {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
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
                if (!isRefreshing) {
                    isRefreshing = true;
                    originalRequest._retry = true;

                    const refreshToken = localStorage.getItem('refresh_token');

                    if (refreshToken) {
                        try {
                            const response = await axios.post(`${apiUrl}/api/token/refresh/`, {
                                refresh: refreshToken,
                            });
                            const newAccessToken = response.data.access;

                            localStorage.setItem('access_token', newAccessToken);
                            axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                            processQueue(null, newAccessToken);

                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                            return axios(originalRequest);
                        } catch (refreshError) {
                            processQueue(refreshError, null);
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            window.location.href = '/login'; // Redirect to login on failure
                            return Promise.reject(refreshError);
                        } finally {
                            isRefreshing = false;
                        }
                    } else {
                        window.location.href = '/login'; // If no refresh token, log out
                        return Promise.reject(error);
                    }
                }

                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                });
            }

            return Promise.reject(error);
        }
    );
};

export default setupInterceptors;
