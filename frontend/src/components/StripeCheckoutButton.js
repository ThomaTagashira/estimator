// StripeCheckoutButton.js

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
const apiUrl = process.env.REACT_APP_API_URL;

export const SubscriptionCheckoutButton = ({ apiEndpoint, tier }) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);

        const stripe = await stripePromise;

        try {
            const token = localStorage.getItem('access_token');
            if (!tier) {
                console.error('Subscription tier is required');
                setLoading(false);
                return;
            }

            const response = await fetch(`${apiUrl}${apiEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ tier: tier }),
            });

            const session = await response.json();

            if (session.error) {
                console.error(session.error);
                setLoading(false);
                return;
            }

            const result = await stripe.redirectToCheckout({
                sessionId: session.sessionId,
            });

            if (result.error) {
                console.error(result.error.message);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error initiating checkout session:', error);
            setLoading(false);
        }
    };

    return (
        <button role="link" onClick={handleClick} disabled={loading}>
            {loading ? 'Processing...' : `Subscribe to ${tier} Plan`}
        </button>
    );
};


export const TokenCheckoutButton = ({ apiEndpoint, tokenQty }) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);

        const stripe = await stripePromise;

        try {
            const token = localStorage.getItem('access_token');
                console.log('Access Token:', token);
            if (!tokenQty) {
                console.error('Token quantity is required');
                setLoading(false);
                return;
            }

            const response = await fetch(`${apiUrl}${apiEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ tokenQty: tokenQty }),
            });

            const session = await response.json();

            if (session.error) {
                console.error(session.error);
                setLoading(false);
                return;
            }

            const result = await stripe.redirectToCheckout({
                sessionId: session.sessionId,
            });

            if (result.error) {
                console.error(result.error.message);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error initiating checkout session:', error);
            setLoading(false);
        }
    };

    return (
        <button role="link" onClick={handleClick} disabled={loading}>
            {loading ? 'Processing...' : `Purchase ${tokenQty} Tokens`}
        </button>
    );
};




export const CancelSubscriptionButton = ({ apiEndpoint }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Access token not found. Please log in again.');
            }

            const response = await fetch(`${apiUrl}${apiEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to cancel subscription.');
            }

            setSuccessMessage(data.message);
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            <button role="link" onClick={handleClick} disabled={loading}>
                {loading ? 'Processing...' : 'Cancel Subscription'}
            </button>
        </div>
    );
};

