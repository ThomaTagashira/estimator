import React, { useState } from 'react';
import '../components_css/ComponentsFormFields.css';

function SearchForm({ onScopeSubmit }) {
  // const [textInput, setTextInput] = useState('');
  const [scopeInput, setScopeInput] = useState('');
  // const [handymanScopeInput, setHandymanScopeInput] = useState('');
  // const [textError, setTextError] = useState('');
  const [scopeError, setScopeError] = useState('');
  // const [handymanScopeError, setHandymanScopeError] = useState('');

  // const handleTextSubmit = (e) => {
  //   e.preventDefault();
  //   if (textInput.trim() !== '') {
  //     onTextSubmit(textInput);
  //     setTextInput('');
  //     setTextError('');
  //   } else {
  //     setTextError('Text input cannot be empty');
  //   }
  // };


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

  // const handleHandymanScopeSubmit = (e) => {
  //   e.preventDefault();
  //   if (handymanScopeInput.trim() !== '') {
  //     onHandymanScopeSubmit(handymanScopeInput);
  //     setHandymanScopeInput('');
  //     setHandymanScopeError('');
  //   } else {
  //     setHandymanScopeError('Handyman Job scope input cannot be empty');
  //   }
  // };


  return (
    <div className="uploaded-lines-container">
      {/* <form onSubmit={handleTextSubmit}>
        <label htmlFor="input-text">Enter text:</label>
        <input
          type="text"
          id="input-text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          aria-label="Enter text"
          aria-describedby="text-error"
        />
        <br />
        <span id="text-error" style={{ color: 'red' }}>{textError}</span>
        <br />
        <button type="submit" disabled={!textInput.trim()}>Submit Text</button>
      </form> */}
      <div className="uploaded-lines">
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


      {/* <form onSubmit={handleHandymanScopeSubmit}>
        <label htmlFor="handyman-job-scope">Enter job scope if using a Handyman:</label>
        <input
          type="text"
          id="handyman-job-scope"
          value={handymanScopeInput}
          onChange={(e) => setHandymanScopeInput(e.target.value)}
          aria-label="Enter handyman job scope"
          aria-describedby="handyman-scope-error"
        />
        <br />
        <span id="handyman-scope-error" style={{ color: 'red' }}>{handymanScopeError}</span>
        <br />
        <button type="submit" disabled={!handymanScopeInput.trim()}>Submit Handyman Job Scope</button>
      </form> */}
      </div>
    </div>
  );
}

export default SearchForm;