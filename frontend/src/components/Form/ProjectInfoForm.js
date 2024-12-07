import React from 'react';
import '../components_css/ComponentsFormFields.css';

const ProjectInfoForm = ({
  projectInfo,
  handleProjectInfoChange,
  handlePrevious,
  handleSubmit,
}) => {
  return (
    <div>
      <form>
        <div className="form-group">
          <label htmlFor="projectName">
            <span className="form-icon">📋</span> Project Name
          </label>
          <input
            id="projectName"
            type="text"
            name="projectName"
            value={projectInfo.projectName}
            onChange={handleProjectInfoChange}
            placeholder="Enter project name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="projectLocation">
            <span className="form-icon">📍</span> Project Location
          </label>
          <input
            id="projectLocation"
            type="text"
            name="projectLocation"
            value={projectInfo.projectLocation}
            onChange={handleProjectInfoChange}
            placeholder="Enter project location"
          />
        </div>
        <div className="form-group">
          <label htmlFor="startDate">
            <span className="form-icon">📅</span> Start Date
          </label>
          <input
            id="startDate"
            type="date"
            name="startDate"
            value={projectInfo.startDate}
            onChange={handleProjectInfoChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">
            <span className="form-icon">🛑</span> End Date
          </label>
          <input
            id="endDate"
            type="date"
            name="endDate"
            value={projectInfo.endDate}
            onChange={handleProjectInfoChange}
          />
        </div>
        <div className="button-group">
          <button type="button" className="next-btn" onClick={handlePrevious}>
            Previous
          </button>
          <button type="button" className="next-btn" onClick={handleSubmit}>
            Create Estimate
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectInfoForm;
