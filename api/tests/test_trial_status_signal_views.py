from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from api.models import Subscription

class TrialStatusSignalTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.subscription = Subscription.objects.create(
            user=self.user,
            trial_end_date=timezone.now() - timezone.timedelta(days=1),  
            in_trial=True
        )

    def test_trial_status_updated_on_login(self):
        self.client.login(username='testuser', password='password')

        self.subscription.refresh_from_db()

        self.assertFalse(self.subscription.in_trial)