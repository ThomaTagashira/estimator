// App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, redirect, useNavigate } from 'react-router-dom';
import setupInterceptors from './components/setupInterceptor';
import Login from './components/Login';
import Register from './components/Register';
import PhotoUploadForm from './components/PhotoUploadForm';
import SearchForm from './components/SearchForm';
import DynamicTable from './addString';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import GitHubCallback from './components/GitHubCallback';
import GoogleCallback from './components/GoogleCallback';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './components/PaymentForm';
import Header from './components/Header';
import SubscriptionPage from './components/SubscriptionPage';
import TokenPurchasePage from './components/TokenPurchasePage';
import SuccessPage from './components/SuccessPage';
import CancelPage from './components/CancelPage';

setupInterceptors();
const apiUrl = process.env.REACT_APP_API_URL;
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [textResults, setTextResults] = useState({});
  const [scopeResults, setScopeResults] = useState(null);
  const [handymanScopeResults, setHandymanScopeResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedString, setSelectedString] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);


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


  const fetchTextData = (inputText) => {
    setLoading(true);
    setError(null);

    axios.post(`${apiUrl}/api/index/`, { input_text: inputText })
      .then(response => {
        setTextResults(response.data);
        setScopeResults(null);
        setHandymanScopeResults(null);
      })
      .catch(error => {
        setError('Error fetching text data: ' + error.message);
      })
      .finally(() => setLoading(false));
  };

  const fetchScopeData = (jobScope) => {
    setLoading(true);
    setError(null);

    axios.post(`${apiUrl}/api/scope/`, { job_scope: jobScope })
      .then(response => {
        setScopeResults(response.data);
        setTextResults({});
        setHandymanScopeResults(null);

        const context = response.data.response;
        const startIndex = context.indexOf(':') + 1;
        let endIndex = context.indexOf('Total Cost:');
        if (endIndex === -1) {
          endIndex = context.length;
        }
        const selectedString = context.substring(startIndex, endIndex).trim();
        setSelectedString(selectedString);
      })
      .catch(error => {
        setError('Error fetching scope data: ' + error.message);
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = async (lines) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiUrl}/api/line/`, { Line: lines });
      setSearchResult(response.data);

      const context = response.data.response;
      const startIndex = context.indexOf(':') + 1;
      let endIndex = context.indexOf('Total Cost:');
      if (endIndex === -1) {
        endIndex = context.length;
      }
      const selectedString = context.substring(startIndex, endIndex).trim();
      setSelectedString(selectedString);
    } catch (error) {
      setError('Error performing search: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const combinedResults = `${scopeResults?.response || ''}\n\n${searchResult?.response || ''}`.trim();

  return (
    <Router>
      <Header handleLogout={handleLogout} hasActiveSubscription={hasActiveSubscription} />
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/google-callback" element={<GoogleCallback setIsAuthenticated={setIsAuthenticated} setHasActiveSubscription={setHasActiveSubscription} />} />
        <Route path="/github-callback" element={<GitHubCallback setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/buy-tokens" element={<TokenPurchasePage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/" element={
            <AuthenticatedRoute isAuthenticated={isAuthenticated} hasActiveSubscription={hasActiveSubscription}>
            <div className="App">
              <SearchForm onTextSubmit={fetchTextData} onScopeSubmit={fetchScopeData} />

              <h1>Photo Upload Form</h1>
              <PhotoUploadForm onSearch={handleSearch} />

              <div>
                <h1>Data from Backend:</h1>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                {Object.keys(textResults).length > 0 && (
                  <div>
                    <h2>Text Data:</h2>
                    <ul>
                      {Object.keys(textResults).map(key => (
                        <li key={key}>{textResults[key]}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {combinedResults && (
                  <div>
                    <h2>Combined Results:</h2>
                    {combinedResults.split('\n\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                    <DynamicTable selectedString={selectedString} />
                  </div>
                )}
                {Object.keys(textResults).length === 0 && !scopeResults && !handymanScopeResults && !searchResult && !error && <p>No data available</p>}
              </div>

              {/* Payment Section */}
              <div className="payment-section">
                <button onClick={() => setShowPaymentForm(!showPaymentForm)}>
                  {showPaymentForm ? 'Hide Payment Form' : 'Proceed to Payment'}
                </button>
                {showPaymentForm && (
                  <Elements stripe={stripePromise}>
                    <PaymentForm />
                  </Elements>
                )}
              </div>
            </div>
          </AuthenticatedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
