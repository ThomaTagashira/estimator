import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthenticatedRoute = ({ children, isAuthenticated, hasActiveSubscription, inTrial, authIsLoading }) => {

    if (authIsLoading) {
        return <div>Loading...</div>; 
    }

    if (!isAuthenticated && !hasActiveSubscription && !inTrial) {
        console.log('AuthenticatedRoute: no sub, sub, or trial');
        return <Navigate to="/login" />;
    }

    if (!isAuthenticated) {
        console.log('AuthenticatedRoute: not authenticated');
        return <Navigate to="/complete-login" />;
    }

    if (!hasActiveSubscription && !inTrial) {
        console.log('AuthenticatedRoute: no active sub');
        return <Navigate to="/subscribe" />;
    }

    return children;
};

export default AuthenticatedRoute;
