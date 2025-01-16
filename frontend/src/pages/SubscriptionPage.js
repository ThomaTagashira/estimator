import React, { useState } from 'react';
import './pages_css/Pages.css';
import SubscrptionPlanCards from '../components/SubscriptionPlanCards';

const SubscriptionPage = () => {
    const [tier, setNewTier] = useState(''); 

    const handleSelectNewTier = (tier) => {
        setNewTier(tier);
    };

    return (
        <div className="purchase-container">

            <div className="purchase-header">
                <h1>Subscribe to Our Service</h1>
                <p>Please choose a subscription tier to access our features.</p>
                <h2>Select Your Plan</h2>
            </div>

            <SubscrptionPlanCards handleSelectNewTier={handleSelectNewTier} tier={tier}/>

        </div>    
    );
};

export default SubscriptionPage;
