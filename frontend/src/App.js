import React, { useState, useEffect, useCallback, createContext } from 'react';
import axios from 'axios';
import { Route, Routes } from 'react-router-dom';
import AuthenticatedRoute from './components/Auth/AuthenticatedRoute';
import PasswordResetRequestForm from './components/Form/PasswordResetRequestForm';
import useAuth from './hooks/useAuth';

import {
  setupInterceptors,
  GoogleCallback,
  // GitHubCallback,
  Header,
  Footer,
  PasswordResetConfirm,
  VerifyEmailSuccess,
  VerifyUserEmailUpdateSuccess,
  VerifyUserEmailUpdateFailure,
} from './components';

import {
    SuccessPage,
    SearchPage,
    CancelPage,
    SubscriptionPage,
    TokenPurchasePage,
    LoginPage, 
    RegisterPage,
    CreateEstimatePage,
    EstimatesPage,
    EstimateDetailPage,
    BusinessInfoPage,
    CancelSubscriptionPage,
    ChangeSubscriptionPage,
    ExportPDFPage,
    DynamicTablePage,
    TermsAndConditionsPage,
    RefundPolicyPage,
    PrivacyPolicyPage,
    EmailStatusPage,
    UserProfileSettingsPage,
    LoginCompletePage,
    UpdateEmailPage,
    UpdatePasswordPage
}  from './pages';


setupInterceptors();
const apiUrl = process.env.REACT_APP_API_URL;
export const UserContext = createContext();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [userSubscriptionTier, setUserSubscriptionTier] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [inTrial, setInTrial] = useState(false)
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authIsLoading, setAuthIsLoading] = useState(true);
  const [isAccountOAuth, setIsAccountOAuth] = useState(false);

  const fetchTokenCount = useCallback(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('No access token found (token count)');
            return;
        }

        console.log('called in app: ', tokenCount);

        try {
            const response = await fetch(`${apiUrl}/api/get-user-token-count/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched token balance from API:', data.token_balance);
                setTokenCount(data.token_balance);
            } else {
                console.error('Failed to fetch token count:', await response.json());
            }
        } catch (error) {
            console.error('Error fetching token balance:', error);
        }
    };

    fetchData(); 
  }, [tokenCount]); 

  const { validateAndFetchSubscriptionStatus } = useAuth({
    setIsAuthenticated,
    setHasActiveSubscription,
    setInTrial,
    setAuthIsLoading,
    setIsAccountOAuth
});

useEffect(() => {
  const initializeAuthState = async () => {
      const storedIsAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const storedHasActiveSubscription = localStorage.getItem('hasActiveSubscription') === 'true';
      const storedInTrial = localStorage.getItem('inTrial') === 'true';

      setIsAuthenticated(storedIsAuthenticated);
      setHasActiveSubscription(storedHasActiveSubscription);
      setInTrial(storedInTrial);

      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
          await validateAndFetchSubscriptionStatus();
      } else {
          console.log('No access token found during initialization');
          setAuthIsLoading(false); 
      }
  };

  initializeAuthState();
}, [validateAndFetchSubscriptionStatus, setIsAuthenticated, setHasActiveSubscription, setInTrial, setAuthIsLoading]);


  useEffect(() => {
    fetchTokenCount(); 
  }, [fetchTokenCount]); 


  useEffect(() => {
    const fetchSubscriptionTier = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
          console.error('No access token found (sub tier)');
          return;
      }

      try {
          const response = await fetch(`${apiUrl}/api/get-user-subscription-tier/`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });

          if (response.ok) {
              const data = await response.json();
              setUserSubscriptionTier(data['subscription tier']); 
              console.log('user tier:', userSubscriptionTier)

          } else {
              console.error('Failed to fetch user subscription:', await response.json());
          }
      } catch (error) {
          console.error('Error fetching subscription tier:', error);
      }
  }; 

  fetchSubscriptionTier();
  }, );

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('hasActiveSubscription');
    localStorage.removeItem('inTrial');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAccountOAuth');

    delete axios.defaults.headers.common['Authorization'];

    setIsAuthenticated(false);
    setHasActiveSubscription(false);
    setInTrial(false);

    window.location.href = 'https://fairbuildapp.com/home.html';
};


  

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailVerificationToken = searchParams.get('token');
    const email = searchParams.get('email');
  
    if (email) {
      setUserEmail(email);
    }
  
    if (emailVerificationToken) {
      axios.get(`${apiUrl}/api/verify-email/${emailVerificationToken}`)
        .then(response => {
          const { access, refresh, has_active_subscription, in_trial } = response.data;
  
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  
          setIsAuthenticated(true);
          setHasActiveSubscription(has_active_subscription);
          setInTrial(in_trial);
        })
        .catch(error => {
          console.error('Error verifying email:', error);
          setIsAuthenticated(false);
          setHasActiveSubscription(false);
          setInTrial(false);
        })
        .finally(() => {
          setIsLoading(false); 
        });
    } else {
      const token = localStorage.getItem('access_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true);
        axios.get(`${apiUrl}/api/subscription/status/`)
          .then(response => {
            setHasActiveSubscription(response.data.has_active_subscription);
            setInTrial(response.data.in_trial);
          })
          .catch(error => {
            if (error.response && error.response.status === 401) {
              setIsAuthenticated(false);
              setHasActiveSubscription(false);
              setInTrial(false);
            } else {
              console.error('Error fetching subscription status:', error);
            }
          })
          .finally(() => {
            setIsLoading(false); 
          });
      } else {
        setIsLoading(false); 
      }
    }
  }, [setIsAuthenticated, setHasActiveSubscription, setInTrial]);
  
  if (isLoading) {
    return <div>Loading...</div>; 
  }
  
  
  

  return (
    <UserContext.Provider value={{ isAuthenticated, hasActiveSubscription, inTrial }}>
      <div className="header-container">
        <Header
          handleLogout={handleLogout}
          hasActiveSubscription={hasActiveSubscription}
          isAuthenticated={isAuthenticated}
          tokenCount={tokenCount}
          userSubscriptionTier={userSubscriptionTier}
          inTrial={inTrial}
          apiUrl={apiUrl}
        />
      </div>  
    
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} setInTrial={setInTrial} setAuthIsLoading={setAuthIsLoading} />} />
        <Route path="/google-callback" element={<GoogleCallback setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} setAuthIsLoading={setAuthIsLoading} setInTrial={setInTrial} setIsAccountOAuth={setIsAccountOAuth}/>} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/buy-tokens" element={<TokenPurchasePage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/termsandconditions" element={<TermsAndConditionsPage />} />
        <Route path="/refundpolicy" element={<RefundPolicyPage />} />
        <Route path="/privacypolicy" element={<PrivacyPolicyPage />} />
        {/* <Route path="/verify-email/:token" element={<VerifyEmail />} /> */}
        <Route path="/verify-email-success" element={<VerifyEmailSuccess setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} setInTrial={setInTrial}/>} />
        <Route path="/email-status" element={<EmailStatusPage apiUrl={apiUrl} userEmail={userEmail}/>} />
        <Route path="/password-reset" element={<PasswordResetRequestForm />} />
        <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} />
        <Route path="/complete-login" element={<LoginCompletePage apiUrl={apiUrl} setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} setInTrial={setInTrial} />} />
        <Route path="/verify-user-email-success" element={<VerifyUserEmailUpdateSuccess setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} setInTrial={setInTrial} setAuthIsLoading={setAuthIsLoading} />} />
        <Route path="/verify-email-failed" element={<VerifyUserEmailUpdateFailure />} />

        <Route path="/search" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
            authIsLoading={authIsLoading}
          >
            <SearchPage apiUrl={apiUrl} fetchTokenCount={fetchTokenCount}/>
          </AuthenticatedRoute>
        }/>

        <Route path="/dynamic-table" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
            authIsLoading={authIsLoading}
          >            
            <DynamicTablePage apiUrl={apiUrl}/>
          </AuthenticatedRoute>
        }/>

        <Route path="/create-estimate" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
            authIsLoading={authIsLoading}
          >            
            <CreateEstimatePage apiUrl={apiUrl} />
          </AuthenticatedRoute>
        }/>

        <Route path="/saved-estimate/:estimateId" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
            authIsLoading={authIsLoading}
          >            
            <EstimateDetailPage apiUrl={apiUrl} />
          </AuthenticatedRoute>
        }/>

        <Route path="/save-business-info" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
            authIsLoading={authIsLoading}
          >
            <BusinessInfoPage apiUrl={apiUrl} />
          </AuthenticatedRoute>
        }/>

        <Route path="/cancel-subscription" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
            authIsLoading={authIsLoading}
          >            
            <CancelSubscriptionPage  apiUrl={apiUrl} />
          </AuthenticatedRoute>
        }/>

        <Route path="/change-subscription-tier" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
            authIsLoading={authIsLoading}
          >            
            <ChangeSubscriptionPage  apiUrl={apiUrl} userSubscriptionTier={userSubscriptionTier} />
          </AuthenticatedRoute>
        }/>

        <Route path="/export-pdf" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
            authIsLoading={authIsLoading}
          >            
            <ExportPDFPage  apiUrl={apiUrl} userSubscriptionTier={userSubscriptionTier} />
          </AuthenticatedRoute>
        }/>

        <Route path="/user-profile-settings" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
            authIsLoading={authIsLoading}
          >
            <UserProfileSettingsPage apiUrl={apiUrl} isAccountOAuth={isAccountOAuth}/>
          </AuthenticatedRoute>
        }/>

        <Route path="/user-update-email" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
            authIsLoading={authIsLoading}
          >
            <UpdateEmailPage apiUrl={apiUrl} />
          </AuthenticatedRoute>
        }/>

        <Route path="/user-update-password" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
            authIsLoading={authIsLoading}
          >
            <UpdatePasswordPage apiUrl={apiUrl} />
          </AuthenticatedRoute>
        }/>

        <Route
          path="/"
          element={
            (inTrial || (isAuthenticated && hasActiveSubscription)) ? (
              <EstimatesPage />
            ) : (
              <LoginPage
                setIsAuthenticated={setIsAuthenticated}
                setHasActiveSubscription={setHasActiveSubscription}
                setInTrial={setInTrial}
              />
            )
          }
        />
      </Routes>
      
      <div className='footer-container'>
        <Footer />
      </div>    
    </UserContext.Provider>
  );
}

export default App;
