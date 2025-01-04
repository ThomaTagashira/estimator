from rest_framework.permissions import BasePermission

class HasActiveSubscriptionOrTrial(BasePermission):
    """
    Allows access to users with an active subscription or those in their trial period.
    """
    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and hasattr(user, 'subscription'):
            subscription = user.subscription
            return subscription.is_active or subscription.in_trial
        return False
