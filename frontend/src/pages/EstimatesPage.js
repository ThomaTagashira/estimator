import React from 'react';
import useFetchEstimates from '../hooks/useFetchEstimates';
import EstimateList from '../components/EstimateList';

const EstimatesPage = ({ apiUrl }) => {
  const { estimates, loading, error } = useFetchEstimates(apiUrl);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>My Estimates</h2>
      <EstimateList estimates={estimates} />
    </div>
  );
};

export default EstimatesPage;
