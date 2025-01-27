import React, { useState } from 'react';
import SubscrptionPlanCards from '../components/SubscriptionPlanCards';
const ChangeSubscriptionPage = ({ userSubscriptionTier }) => {
    const [tier, setNewTier] = useState(''); 

    const handleSelectNewTier = (tier) => {
        setNewTier(tier);
    };

    return (
        <div className="purchase-container">

            <div className="purchase-header">
                <h2>Select a New Plan</h2>
                <h3>Your Current Plan: {userSubscriptionTier}</h3>
            </div>

            <SubscrptionPlanCards handleSelectNewTier={handleSelectNewTier} tier={tier}/>

        </div>
    );
};

export default ChangeSubscriptionPage;
