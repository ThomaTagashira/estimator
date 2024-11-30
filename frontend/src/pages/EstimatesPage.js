import React, { useState } from 'react';
import useFetchEstimates from '../hooks/useFetchEstimates';
import EstimateList from '../components/EstimateList';
import { Link } from 'react-router-dom';
import './EstimatesPage.css';

const apiUrl = process.env.REACT_APP_API_URL;

const EstimatesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    estimates, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    setCurrentPage, 
    fetchEstimates,
  } = useFetchEstimates(apiUrl);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEstimates({ search: searchQuery, page: 1 });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page); 
    fetchEstimates({ search: searchQuery, page }); 
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="estimates-page">
      <Link to="/create-estimate">
        <button>Create New Estimate</button>
      </Link>

      <h2>My Estimates</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by Estimate ID or Project Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <EstimateList 
        estimates={estimates}
        apiUrl={apiUrl}
      />

      <div className="pagination">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            disabled={currentPage === index + 1}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};


export default EstimatesPage;
