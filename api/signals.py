from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in
from django.utils import timezone
from .models import Subscription

def check_trial_status(user):
    try:
        subscription = user.subscription
        if subscription.in_trial and subscription.trial_end_date < timezone.now():
            subscription.in_trial = False
            subscription.save()
    except Subscription.DoesNotExist:
        # Handle the case where the user does not have a subscription
        pass

@receiver(user_logged_in)
def update_trial_status_on_login(sender, request, user, **kwargs):
    check_trial_status(user)