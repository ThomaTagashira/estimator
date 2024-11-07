import React from 'react';

const ProjectInfoForm = ({
  projectInfo,
  handleProjectInfoChange,
  handlePrevious,
  handleSubmit,
}) => {

  return (
    <div className="project-info">
      <h3>Project Information</h3>
      <div>
        <input
          type="text"
          name="projectName"
          value={projectInfo.projectName}
          onChange={handleProjectInfoChange}
          placeholder="Project Name"
        />
      </div>
      <div>
        <input
          type="text"
          name="projectLocation"
          value={projectInfo.projectLocation}
          onChange={handleProjectInfoChange}
          placeholder="Project Location"
        />
      </div>
      <div>
        <input
          type="date"
          name="startDate"
          value={projectInfo.startDate}
          onChange={handleProjectInfoChange}
          placeholder="Start Date"
        />
      </div>
      <div>
        <input
          type="date"
          name="endDate"
          value={projectInfo.endDate}
          onChange={handleProjectInfoChange}
          placeholder="End Date"
        />
      </div>
      <button onClick={handlePrevious}>Previous</button>
      <button onClick={handleSubmit}>Create Estimate</button>
    </div>
  );
};

export default ProjectInfoForm;
