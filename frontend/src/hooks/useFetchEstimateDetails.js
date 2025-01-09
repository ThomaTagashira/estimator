import { useState, useEffect } from 'react';

const useFetchEstimateDetails = (apiUrl, estimateId) => {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstimateDetails = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
          setError('Access token is missing');
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/saved-estimates/${estimateId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEstimate(data);
        } else {
          throw new Error('Failed to fetch estimate data');
        }

      } catch (err) {
        setError(err.message || 'Failed to fetch estimate data');
      } finally {
        setLoading(false);
      }
    };

    fetchEstimateDetails();
  }, [apiUrl, estimateId]);

  return { estimate, loading, error };
};

export default useFetchEstimateDetails;
