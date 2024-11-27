import React from 'react';
import useFetchEstimates from '../hooks/useFetchEstimates';
import EstimateList from '../components/EstimateList';
import { Link } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const EstimatesPage = () => {
  const { 
    estimates, 
    loading, 
    error,
    handleDeleteEstimate
  } = useFetchEstimates(apiUrl);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="estimates-page">
                <Link to="/create-estimate">
                  <button>Create New Estimate</button>
                </Link>
          <h2>My Estimates</h2>
      <EstimateList 
        estimates={estimates}
        onDelete={handleDeleteEstimate}
        apiUrl={apiUrl}
      />
    </div>
  );
};

export default EstimatesPage;
