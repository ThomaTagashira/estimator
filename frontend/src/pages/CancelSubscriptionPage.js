import {CancelSubscriptionButton} from '../components/StripeCheckoutButton'; 

const CancelSubscriptionPage = () => {

    return (
        <div>
            <h1>We're sorry to hear you go!</h1>

            <h2>Important Notice: Subscription Cancellation Policy</h2>

            <p>Upon canceling your subscription, your saved estimates and unused tokens will remain available for reactivation until the end of your billing cycle. 
                If you choose to reactivate your subscription within this period, these resources will be fully restored to your account. 
                After the last day of your billing cycle has passed, all saved estimates and unused tokens will be permanently deleted and cannot be recovered.</p>

            <div>
                <h3>If you understand and wish to proceed, please click the button below to confirm the cancellation of your subscription.</h3>
                <CancelSubscriptionButton
                    apiEndpoint="/api/cancel-subscription/"
                />
            </div>
        </div>
    );
};

export default CancelSubscriptionPage