import { Navigate } from 'react-router-dom';

const AuthenticatedRoute = ({ children, isAuthenticated, hasActiveSubscription }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (!hasActiveSubscription) {
    return <Navigate to="/subscribe" />; // Redirect if no active subscription
  }

  return children;
};

export default AuthenticatedRoute;