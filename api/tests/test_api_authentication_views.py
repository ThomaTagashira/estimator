from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from ..models import Subscription

class AuthAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword",
            is_active=True
        )

        self.subscription = Subscription.objects.create(
            user=self.user,
            is_active=True,
            profile_completed=False
        )

        self.username_token_url = "/api/userToken/"  
        self.google_token_url = "/api/googleToken/" 
        self.complete_profile_url = "/api/subscription/complete-profile/"

    def tearDown(self):
        User.objects.all().delete()
        Subscription.objects.all().delete()


    def test_username_token_obtain_pair_success(self):
        response = self.client.post(self.username_token_url, {
            "username": "testuser",
            "password": "testpassword"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("has_active_subscription", response.data)
        self.assertIn("profile_completed", response.data)
        self.assertTrue(response.data["has_active_subscription"])
        self.assertFalse(response.data["profile_completed"])


    def test_username_token_obtain_pair_inactive_user(self):
        self.user.is_active = False
        self.user.save()

        response = self.client.post(self.username_token_url, {
            "username": "testuser",
            "password": "testpassword"
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "Email not verified. Please verify your email to proceed.")


    def test_username_token_obtain_pair_inactive_user(self):
        self.user.is_active = False
        self.user.save()

        response = self.client.post(self.username_token_url, {
            "username": "testuser",
            "password": "testpassword"
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "Email not verified. Please verify your email to proceed.")


    def test_username_token_obtain_pair_invalid_credentials(self):
        response = self.client.post(self.username_token_url, {
            "username": "testuser",
            "password": "wrongpassword"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "No active account found with the given credentials")



    def test_google_token_obtain_pair_success(self):
        response = self.client.post(self.google_token_url, {
            "username": "testuser"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("has_active_subscription", response.data)
        self.assertIn("profile_completed", response.data)
        self.assertTrue(response.data["has_active_subscription"])
        self.assertFalse(response.data["profile_completed"])




    def test_google_token_obtain_pair_nonexistent_user(self):
        response = self.client.post(self.google_token_url, {
            "username": "nonexistentuser" 
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "Invalid credentials.")



    def test_complete_profile_success(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(self.complete_profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "Profile completed and tokens distributed")

        self.subscription.refresh_from_db()
        self.assertTrue(self.subscription.profile_completed)


    def test_complete_profile_unauthenticated(self):
        response = self.client.post(self.complete_profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


    def test_complete_profile_no_subscription(self):
        Subscription.objects.filter(user=self.user).delete()
        print("Subscriptions after deletion:", Subscription.objects.filter(user=self.user).count())  # Debugging

        self.client.force_authenticate(user=self.user)

        response = self.client.post(self.complete_profile_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "No subscription found")