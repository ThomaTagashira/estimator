import React from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const apiUrl = process.env.REACT_APP_API_URL;

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("Form submitted!"); // Check if this logs when you click the button

        if (!stripe || !elements) {
            console.error("Stripe.js has not loaded yet.");
            return;
        }

        const cardElement = elements.getElement(CardElement);
        const { error, token } = await stripe.createToken(cardElement);

        if (error) {
            console.error("Error creating token:", error);
        } else {
            console.log("Token created:", token);
            const response = await fetch(`${apiUrl}/api/payments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: token.id }),
            });

            if (response.ok) {
                console.log("Payment successful!");
            } else {
                const responseData = await response.json();
                console.error("Payment failed:", responseData.error);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe}>
                Pay
            </button>
        </form>
    );
};

export default PaymentForm;