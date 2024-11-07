import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, redirect } from 'react-router-dom';
import setupInterceptors from './components/setupInterceptor';
import GoogleCallback from './components/GoogleCallback';
// import GitHubCallback from './components/GitHubCallback';
import { BusinessInfoUpdateSuccessPage, SuccessPage, SearchResults, CancelPage, SubscriptionPage, TokenPurchasePage, DashboardPage, LoginPage, RegisterPage, CreateEstimatePage, EstimatesPage, EstimateDetailPage, BusinessInfoPage }  from './pages';
import Header from './components/Header';
import AuthenticatedRoute from './components/Auth/AuthenticatedRoute';

setupInterceptors();
const apiUrl = process.env.REACT_APP_API_URL;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

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
      <Header handleLogout={handleLogout} hasActiveSubscription={hasActiveSubscription} />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/google-callback" element={<GoogleCallback setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/buy-tokens" element={<TokenPurchasePage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/search" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <SearchResults apiUrl={apiUrl} />
            </AuthenticatedRoute>
        }/>
        <Route path="/estimates" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <SearchResults apiUrl={apiUrl} />
            </AuthenticatedRoute>
        }/>
        <Route path="/create-estimate" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <CreateEstimatePage apiUrl={apiUrl} />
            </AuthenticatedRoute>
        }/>
                <Route path="/saved-estimates" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
              <EstimatesPage apiUrl={apiUrl} />
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

        <Route path="/" element={isAuthenticated && hasActiveSubscription ? (<DashboardPage />) : (<LoginPage setIsAuthenticated={setIsAuthenticated}setHasActiveSubscription={setHasActiveSubscription} />)} />
      </Routes>
    </Router>
  );
}

export default App;
