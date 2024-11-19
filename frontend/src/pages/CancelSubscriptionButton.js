import React, { useState } from 'react';
import axios from 'axios';

const CancelSubscription = () => {
  const [loading, setLoading] = useState(false);

  const handleCancelSubscription = async () => {
    const apiUrl = process.env.REACT_APP_API_URL; // Load from environment variables

    if (!apiUrl) {
      alert('API URL is not configured. Please contact support.');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Access token is missing. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/cancel-subscription/`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      alert(`Success: ${response.data.message}`);
    } catch (error) {
      console.error('Error during cancellation:', error.response || error.message); // Log for debugging
      alert(`Error: ${error.response?.data?.error || 'An error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Cancel Subscription</h2>
      <button onClick={handleCancelSubscription} disabled={loading}>
        {loading ? 'Processing...' : 'Confirm Cancellation'}
      </button>
    </div>
  );
};

export default CancelSubscription;
