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
            const token = localStorage.getItem('access_token'); // Assuming token is stored in localStorage

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
                body: JSON.stringify({ tier: tier }), // Send the selected tier to the backend
            });

            const session = await response.json();

            if (session.error) {
                console.error(session.error);
                setLoading(false);
                return;
            }

            // Redirect to Stripe Checkout
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
            const token = localStorage.getItem('access_token'); // Assuming token is stored in localStorage
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
                body: JSON.stringify({ tokenQty: tokenQty }), // Send the selected token quantity to backend
            });

            const session = await response.json();

            if (session.error) {
                console.error(session.error);
                setLoading(false);
                return;
            }

            // Redirect to Stripe Checkout
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