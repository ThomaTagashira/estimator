import React from 'react';
import ClientInfoForm from '../components/ClientInfoForm';
import ProjectInfoForm from '../components/ProjectInfoForm';
import useCreateEstimate from '../hooks/useCreateEstimate';

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
  );
};

export default CreateEstimatePage;
