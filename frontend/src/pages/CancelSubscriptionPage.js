import {CancelSubscriptionButton} from '../components/StripeCheckoutButton'; 

const CancelSubscriptionPage = () => {

    return (
        <div>
            <h1>We're sorry to hear you go!</h1>

            <h2> Notice: Subscription Cancellation</h2>

            <p>Upon canceling your subscription, you will have access to your account until the end of your billing cycle. If you decide to reactivate your subscription, all saved estimates and unused tokens will be returned to you.</p>

            <div>
                <h3>If you wish to proceed, please click the button below to confirm the cancellation of your subscription.</h3>
                <CancelSubscriptionButton
                    apiEndpoint="/api/cancel-subscription/"
                />
            </div>
        </div>
    );
};

export default CancelSubscriptionPage