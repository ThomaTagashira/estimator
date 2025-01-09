import React from 'react';
import useLoginComplete from '../hooks/useLoginComplete';
import UserInfoForm from '../components/Form/UserInfoForm';
import BusinessInfoForm from '../components/Form/BusinessInfoForm';


const LoginCompletePage = ({apiUrl, setIsAuthenticated, setHasActiveSubscription, setInTrial}) => {
    const {
      step,
      userData,
      businessInfo,
      handleUserDataChange,
      handleBusinessInfoChange,
      handleNext,
      handlePrevious,
      handleLoginCompleteSubmit,
      handleCancel,
    } = useLoginComplete(apiUrl, setIsAuthenticated, setHasActiveSubscription, setInTrial);


  return (
    <div className='page'>
      <div className="create-estimate-page">
        <div className="create-estimate-container-wrapper">
          <div className="tab-navigation">
            <div className={`tab ${step === 1 ? 'active' : ''}`}>User Information</div>
            <div className={`tab ${step === 2 ? 'active' : ''}`}>Business Information</div>
          </div>

          <div className="create-estimate-container">
            {step === 1 && (
              <UserInfoForm
                userData={userData}
                handleUserDataChange={handleUserDataChange}
                handleNext={handleNext}
                handleCancel={handleCancel}
              />
            )}
            {step === 2 && (
              <BusinessInfoForm
                businessInfo={businessInfo}
                handleBusinessInfoChange={handleBusinessInfoChange}
                handlePrevious={handlePrevious}
                handleLoginCompleteSubmit={handleLoginCompleteSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCompletePage;
