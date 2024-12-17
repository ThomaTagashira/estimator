import React, { useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import './components_css/Components.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const EstimateList = ({ estimates: initialEstimates, loading, error, apiUrl, fetchEstimates }) => {
  const [estimates, setEstimates] = useState(initialEstimates);
  const [deletingEstimate, setDeletingEstimate] = useState(null);
  const navigate = useNavigate(); 

  const navigateToEstimate = (estimateId) => {
    navigate(`/search?estimateId=${estimateId}`); 
  };
  const confirmDelete = (estimate) => {
    setDeletingEstimate(estimate); 
  };

  const cancelDelete = () => {
    setDeletingEstimate(null); 
  };

  const handleDelete = async () => {
    if (!deletingEstimate) return; 

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`${apiUrl}/api/delete-estimate/${deletingEstimate.estimate_id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Estimate deleted successfully.');

        setEstimates((prev) => prev.filter((est) => est.estimate_id !== deletingEstimate.estimate_id));
        fetchEstimates();
        setDeletingEstimate(null); 
      } else {
        console.error('Failed to delete estimate:', response.statusText);
      }
    } catch (err) {
      console.error('Error deleting estimate:', err);
    }
  };

  if (loading) {
    return <p>Loading estimates...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (estimates.length === 0) {
    return <p>No estimates available</p>;
  }

  return (
    <div className="estimate-list-table">
      <table>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Estimate Number</th>
            <th>Date Created</th>
            <th>Last Modified</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((estimate) => (
            <tr
              key={estimate.estimate_id}
              className="estimate-list-row"
              onClick={() => navigateToEstimate(estimate.estimate_id)} 
            >
              <td>{estimate.project_name || 'Unnamed Project'}</td>
              <td>{estimate.estimate_id}</td>
              <td>{new Date(estimate.date_created).toLocaleDateString()}</td>
              <td>{new Date(estimate.last_modified).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    confirmDelete(estimate);
                  }}
                  className="delete-button"
                >
                  <FontAwesomeIcon icon={faTrash} style={{ color: 'red', cursor: 'pointer' }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  
      {/* Slide-Out Panel */}
      {deletingEstimate && (
        <div className="slide-out-panel">
          <p><strong>WARNING:</strong></p>
          <p>Are you sure you want to delete Estimate: <strong>{deletingEstimate.estimate_id}</strong>?</p>
          <p>By selecting confirm, you will no longer have access to any records you have saved in:</p>
          <p>Project: <strong>{deletingEstimate.project_name || 'Unnamed Project'}</strong></p>
          <p>Estimate Number: <strong>{deletingEstimate.estimate_id}</strong></p>
          
          <div className='slide-out-btn'>
            <button onClick={handleDelete} className="confirm-button">Confirm</button>
            <button onClick={cancelDelete} className="cancel-button">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );  
};

export default EstimateList;
