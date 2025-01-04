from rest_framework.throttling import UserRateThrottle

class ResendEmailThrottle(UserRateThrottle):
    scope = 'resend_email'  
    rate = '5/hour'  