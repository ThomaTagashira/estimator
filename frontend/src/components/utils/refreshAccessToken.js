// utils/refreshAccessToken.js
const refreshAccessToken = async (apiUrl) => {
    const refreshToken = localStorage.getItem('refresh_token');
  
    if (!refreshToken) {
      console.error('No refresh token available');
      return null;
    }
  
    try {
      const response = await fetch(`${apiUrl}/api/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem('access_token', data.access); 
        return data.access;
      } else {
        console.error('Failed to refresh token:', data);
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };
  
  export default refreshAccessToken;
  