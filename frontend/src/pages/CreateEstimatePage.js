import React from 'react';
import ClientInfoForm from '../components/Form/ClientInfoForm';
import ProjectInfoForm from '../components/Form/ProjectInfoForm';
import useCreateEstimate from '../hooks/useCreateEstimate';
import './pages_css/CreateEstimatePage.css'; 

const apiUrl = process.env.REACT_APP_API_URL;

const CreateEstimatePage = () => {
  const {
    step,
    clientInfo,
    projectInfo,
    handleClientInfoChange,
    handleProjectInfoChange,
    handleNext,
    handlePrevious,
    handleSubmit,
  } = useCreateEstimate(apiUrl);

  return (
    <div className="create-estimate-page">
      <div className="form-container-wrapper">
        <div className="tab-navigation">
          <div className={`tab ${step === 1 ? 'active' : ''}`}>Client Information</div>
          <div className={`tab ${step === 2 ? 'active' : ''}`}>Project Information</div>
        </div>

        <div className="form-container">
          {step === 1 && (
            <ClientInfoForm
              clientInfo={clientInfo}
              handleClientInfoChange={handleClientInfoChange}
              handleNext={handleNext}
            />
          )}
          {step === 2 && (
            <ProjectInfoForm
              projectInfo={projectInfo}
              handleProjectInfoChange={handleProjectInfoChange}
              handlePrevious={handlePrevious}
              handleSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEstimatePage;