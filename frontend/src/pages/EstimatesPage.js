import React, { useState } from 'react';
import useFetchEstimates from '../hooks/useFetchEstimates';
import EstimateList from '../components/EstimateList';
import { Link } from 'react-router-dom';
import './pages_css/Pages.css';

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
    <div className="page">
      <div className="estimates-page-header">
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <div className="estimates-search">
              <input
                type="text"
                placeholder="Search by Estimate ID or Project Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </div>
          </form>
        </div>
        <div className='create-btn'>
        <Link to="/create-estimate">
          <button className="create-btn">+ Create New Estimate</button>
        </Link>
        </div>
      </div>

      <div className="estimate-list-container">
        <EstimateList estimates={estimates} apiUrl={apiUrl} fetchEstimates={fetchEstimates} />
        <div className="pagination">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? 'active' : ''}
              disabled={currentPage === index + 1}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


export default EstimatesPage;
