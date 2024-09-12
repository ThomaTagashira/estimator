import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;
let isRefreshing = false;
let failedQueue = [];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 1;

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
                if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
                    console.warn('Max refresh attempts reached. Logging out.');
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/';
                    return Promise.reject(error);
                }

                if (!isRefreshing) {
                    originalRequest._retry = true;
                    isRefreshing = true;
                    refreshAttempts += 1;

                    const refreshToken = localStorage.getItem('refresh_token');

                    if (refreshToken) {
                        try {
                            const response = await axios.post(`${apiUrl}/api/token/refresh/`, {
                                refresh: refreshToken,
                            });
                            const newAccessToken = response.data.access;

                            if (newAccessToken) {
                                localStorage.setItem('access_token', newAccessToken);
                                axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                                processQueue(null, newAccessToken);
                                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                                refreshAttempts = 0;
                                return axios(originalRequest);
                            } else {
                                throw new Error('No access token received');
                            }
                        } catch (refreshError) {
                            processQueue(refreshError, null);
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            window.location.href = '/';
                            return Promise.reject(refreshError);
                        } finally {
                            isRefreshing = false;
                        }
                    } else {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        isRefreshing = false;  // Move isRefreshing reset here
                        window.location.href = '/';
                        return Promise.reject(error);
                    }
                }

                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                });
            }

            return Promise.reject(error);
        }
    );
};

export default setupInterceptors;
