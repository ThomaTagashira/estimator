import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, redirect } from 'react-router-dom';
import setupInterceptors from './components/setupInterceptor';
import GoogleCallback from './components/GoogleCallback';
// import GitHubCallback from './components/GitHubCallback';
import Header from './components/Header';
import AuthenticatedRoute from './components/Auth/AuthenticatedRoute';
import {
    BusinessInfoUpdateSuccessPage,
    SuccessPage,
    SearchPage,
    CancelPage,
    SubscriptionPage,
    TokenPurchasePage,
    LoginPage, RegisterPage,
    CreateEstimatePage,
    EstimatesPage,
    EstimateDetailPage,
    BusinessInfoPage,
    CancelSubscriptionPage,
    ChangeSubscriptionPage,
    ExportPDFPage
}  from './pages';


setupInterceptors();
const apiUrl = process.env.REACT_APP_API_URL;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [userSubscriptionTier, setUserSubscriptionTier] = useState('');
  const [tokenCount, setTokenCount] = useState(0);

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
}, [apiUrl, tokenCount]); 

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
    redirect('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      axios.get(`${apiUrl}/api/subscription/status/`)
        .then(response => {
          setHasActiveSubscription(response.data.has_active_subscription);
        })
        .catch(error => {
          if (error.response && error.response.status === 401) {
            setIsAuthenticated(false);
            setHasActiveSubscription(false);
            redirect('/login');
          } else {
            console.error('Error fetching subscription status:', error);
          }
        });
    }
}, [setIsAuthenticated, setHasActiveSubscription]);

  return (
    <Router>
      <Header handleLogout={handleLogout} hasActiveSubscription={hasActiveSubscription} tokenCount={tokenCount} userSubscriptionTier={userSubscriptionTier} />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/google-callback" element={<GoogleCallback setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/buy-tokens" element={<TokenPurchasePage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/search" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <SearchPage 
                apiUrl={apiUrl}                             
                fetchTokenCount={fetchTokenCount}/>
            </AuthenticatedRoute>
        }/>
        {/* <Route path="/estimates" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <SearchResults apiUrl={apiUrl}/>
            </AuthenticatedRoute>
        }/> */}
        <Route path="/create-estimate" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <CreateEstimatePage apiUrl={apiUrl} />
            </AuthenticatedRoute>
        }/>
                <Route path="/saved-estimate/:estimateId" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <EstimateDetailPage apiUrl={apiUrl} />
            </AuthenticatedRoute>
        }/>
                <Route path="/save-business-info" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <BusinessInfoPage apiUrl={apiUrl} />
            </AuthenticatedRoute>
        }/>
                <Route path="/business-info-update-success" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <BusinessInfoUpdateSuccessPage apiUrl={apiUrl} />
            </AuthenticatedRoute>
        }/>
                <Route path="/cancel-subscription" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <CancelSubscriptionPage  apiUrl={apiUrl} />
            </AuthenticatedRoute>
        }/>
                <Route path="/change-subscription-tier" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <ChangeSubscriptionPage  apiUrl={apiUrl} userSubscriptionTier={userSubscriptionTier} />
            </AuthenticatedRoute>
        }/>
                <Route path="/export-pdf" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <ExportPDFPage  apiUrl={apiUrl} userSubscriptionTier={userSubscriptionTier} />
            </AuthenticatedRoute>
        }/>
        <Route path="/" element={isAuthenticated && hasActiveSubscription ? (<EstimatesPage />) : (<LoginPage setIsAuthenticated={setIsAuthenticated}setHasActiveSubscription={setHasActiveSubscription} />)} />
      </Routes>
    </Router>
  );
}

export default App;
