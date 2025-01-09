from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from ..models import Subscription, UserToken

class CompleteProfileViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpassword", is_active=True)
        self.subscription = Subscription.objects.create(user=self.user, profile_completed=False)
        self.url = "/api/subscription/complete-profile/"
        self.client.force_authenticate(user=self.user)

    def tearDown(self):
        User.objects.all().delete()
        Subscription.objects.all().delete()
        UserToken.objects.all().delete()


    def test_complete_profile_success(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Profile completed and tokens distributed")
        self.assertEqual(response.data["token_balance"], 15)

        self.subscription.refresh_from_db()
        self.assertTrue(self.subscription.profile_completed)

        user_token = UserToken.objects.get(user=self.user)
        self.assertEqual(user_token.token_balance, 15)


    def test_profile_already_completed(self):
        self.subscription.profile_completed = True
        self.subscription.save()

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["message"], "Profile already completed")


    def test_no_subscription_found(self):
        self.subscription.delete()

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "No subscription found")
        

    def test_token_balance_update(self):
        UserToken.objects.create(user=self.user, token_balance=10)

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["token_balance"], 25) 

        user_token = UserToken.objects.get(user=self.user)
        self.assertEqual(user_token.token_balance, 25)


