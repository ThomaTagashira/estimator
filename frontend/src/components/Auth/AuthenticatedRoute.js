import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthenticatedRoute = ({ children, isAuthenticated, hasActiveSubscription, inTrial }) => {
    if (!isAuthenticated) {
        return <Navigate to="/complete-login" />;
    }

    if (!hasActiveSubscription || !inTrial) {
        return <Navigate to="/subscribe" />;
    }

    return children;
};

export default AuthenticatedRoute;
