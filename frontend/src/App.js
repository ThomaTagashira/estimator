import React, { useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, redirect } from 'react-router-dom';
import AuthenticatedRoute from './components/Auth/AuthenticatedRoute';
import PasswordResetRequestForm from './components/Form/PasswordResetRequestForm';

import {
  setupInterceptors,
  GoogleCallback,
  // GitHubCallback,
  Header,
  Footer,
  PasswordResetConfirm,
  VerifyEmailSuccess,
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
}  from './pages';


setupInterceptors();
const apiUrl = process.env.REACT_APP_API_URL;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [userSubscriptionTier, setUserSubscriptionTier] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [inTrial, setInTrial] = useState(false)
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTokenCount = useCallback(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('No access token found');
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

  useEffect(() => {
    fetchTokenCount(); 
  }, [fetchTokenCount]); 


  useEffect(() => {
    const fetchSubscriptionTier = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
          console.error('No access token found');
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

    delete axios.defaults.headers.common['Authorization'];

    setIsAuthenticated(false);
    setHasActiveSubscription(false);
    setInTrial(false);

    redirect('/login');
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
    <Router>
      <div className="header-container">
        <Header
          handleLogout={handleLogout}
          hasActiveSubscription={hasActiveSubscription}
          tokenCount={tokenCount}
          userSubscriptionTier={userSubscriptionTier}
          inTrial={inTrial}
          apiUrl={apiUrl}
        />
      </div>  
    
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} setInTrial={setInTrial} />} />
        <Route path="/google-callback" element={<GoogleCallback setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} />} />
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
        <Route path="/complete-login" element={<LoginCompletePage apiUrl={apiUrl} setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} setInTrial={setInTrial}/>} />

        <Route path="/search" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
          >
            <SearchPage apiUrl={apiUrl} fetchTokenCount={fetchTokenCount}/>
          </AuthenticatedRoute>
        }/>

        <Route path="/dynamic-table" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
          >            
            <DynamicTablePage apiUrl={apiUrl}/>
          </AuthenticatedRoute>
        }/>

        <Route path="/create-estimate" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
          >            
            <CreateEstimatePage apiUrl={apiUrl} />
          </AuthenticatedRoute>
        }/>

        <Route path="/saved-estimate/:estimateId" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
          >            
            <EstimateDetailPage apiUrl={apiUrl} />
          </AuthenticatedRoute>
        }/>

        <Route path="/save-business-info" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
          >
            <BusinessInfoPage apiUrl={apiUrl} />
          </AuthenticatedRoute>
        }/>

        <Route path="/cancel-subscription" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
          >            
            <CancelSubscriptionPage  apiUrl={apiUrl} />
          </AuthenticatedRoute>
        }/>

        <Route path="/change-subscription-tier" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
          >            
            <ChangeSubscriptionPage  apiUrl={apiUrl} userSubscriptionTier={userSubscriptionTier} />
          </AuthenticatedRoute>
        }/>

        <Route path="/export-pdf" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
          >            
            <ExportPDFPage  apiUrl={apiUrl} userSubscriptionTier={userSubscriptionTier} />
          </AuthenticatedRoute>
        }/>



        <Route path="/user-profile-settings" element={
          <AuthenticatedRoute 
            isAuthenticated={isAuthenticated} 
            hasActiveSubscription={hasActiveSubscription}
            inTrial={inTrial}
          >
            <UserProfileSettingsPage apiUrl={apiUrl}/>
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
    </Router>
    
  );
}

export default App;
