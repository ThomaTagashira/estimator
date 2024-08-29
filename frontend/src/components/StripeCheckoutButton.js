// StripeCheckoutButton.js

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
const apiUrl = process.env.REACT_APP_API_URL;

const StripeCheckoutButton = ({ apiEndpoint, tokenAmount }) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);

        const stripe = await stripePromise;

        try {
            const token = localStorage.getItem('access_token'); // Assuming token is stored in localStorage

            const response = await fetch(`${apiUrl}${apiEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ token_amount: tokenAmount }), // For token purchases
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
            {loading ? 'Processing...' : 'Checkout'}
        </button>
    );
};

export default StripeCheckoutButton;
