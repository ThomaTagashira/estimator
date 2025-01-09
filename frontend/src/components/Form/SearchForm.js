import React, { useState } from 'react';
import '../components_css/Components.css';

function SearchForm({ onScopeSubmit }) {
  const [scopeInput, setScopeInput] = useState('');
  const [scopeError, setScopeError] = useState('');



  const handleScopeSubmit = (e) => {
    e.preventDefault();
    if (scopeInput.trim() !== '') {
      onScopeSubmit(scopeInput);
      setScopeInput('');
      setScopeError('');
    } else {
      setScopeError('Job scope input cannot be empty');
    }
  };


  return (
    <div className="uploaded-lines-container">
      <div>
      <form onSubmit={handleScopeSubmit}>
        <label htmlFor="job-scope">Enter job scope:</label>
          <input
            type="text"
            id="job-scope"
            value={scopeInput}
            onChange={(e) => setScopeInput(e.target.value)}
            aria-label="Enter job scope"
            aria-describedby="scope-error"
          />
        <span id="scope-error" style={{ color: 'red' }}>{scopeError}</span>
      </form>

      <button 
        type="submit" 
        disabled={!scopeInput.trim()}
        className="upload-btn"
      >
        Search Task
      </button>
      
      <hr className="divider" />
      </div>
    </div>
  );
}

export default SearchForm;