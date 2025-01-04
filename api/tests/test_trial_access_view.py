from django.test import TestCase
from django.utils.timezone import now, timedelta
from api.models import User, Subscription

class TrialAccessTests(TestCase):

    def setUp(self):
        self.in_trial_user = User.objects.create_user(
            username="in_trial_user", email="in_trial@example.com", password="password"
        )
        self.not_in_trial_user = User.objects.create_user(
            username="not_in_trial_user", email="not_in_trial@example.com", password="password"
        )

        Subscription.objects.create(
            user=self.in_trial_user,
            trial_start_date=now(),
            trial_end_date=now() + timedelta(days=7),
            in_trial=True
        )
        Subscription.objects.create(
            user=self.not_in_trial_user,
            trial_start_date=now() - timedelta(days=8),
            trial_end_date=now() - timedelta(days=1),
            in_trial=False
        )

    def test_users_with_in_trial_have_access(self):
        subscription = Subscription.objects.get(user=self.in_trial_user)
        self.assertTrue(subscription.in_trial, "User with in_trial=True should have access.")

    def test_users_with_in_trial_false_no_access(self):
        subscription = Subscription.objects.get(user=self.not_in_trial_user)
        self.assertFalse(subscription.in_trial, "User with in_trial=False should not have access.")

    def test_in_trial_turns_false_after_trial_end(self):
        subscription = Subscription.objects.get(user=self.in_trial_user)
        subscription.trial_end_date = now() - timedelta(days=1) 
        subscription.save()

        subscription.refresh_from_db()
        self.assertFalse(subscription.in_trial, "User should no longer be in trial after trial_end_date.")
    

