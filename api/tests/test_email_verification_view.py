from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from rest_framework import status
from itsdangerous import URLSafeTimedSerializer
from django.conf import settings
from ..models import StripeProfile, Subscription
from django.core.cache import cache
from unittest.mock import patch


serializer = URLSafeTimedSerializer(settings.SECRET_KEY)


class EmailVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_email = "testuser@example.com"
        self.password = "securepassword123"
        self.user = User.objects.create_user(
            username=self.user_email, email=self.user_email, password=self.password, is_active=False
        )

        self.valid_token = serializer.dumps(self.user_email, salt='email-verify-salt')

        self.verify_email_url = f"/api/verify-email/{self.valid_token}/"
        self.resend_email_url = "/api/resend-verification-email/"
        self.check_status_url = "/api/check-verification-status/"

    def tearDown(self):
        StripeProfile.objects.all().delete()
        Subscription.objects.all().delete()  
        cache.clear()
        cache.clear()




    def test_verify_email_valid_token(self):
        response = self.client.get(self.verify_email_url)
        self.user.refresh_from_db()  
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertTrue(self.user.is_active)
        self.assertTrue(StripeProfile.objects.filter(user=self.user).exists())




    def test_verify_email_invalid_token(self):
        invalid_url = "/api/verify-email/invalid-token/"
        response = self.client.get(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)






    def test_resend_verification_email_valid_user(self):
        response = self.client.post(self.resend_email_url, {"email": self.user_email})
        self.assertEqual(response.status_code, status.HTTP_200_OK)




    def test_resend_verification_email_already_verified(self):
        self.user.is_active = True
        self.user.save()
        response = self.client.post(self.resend_email_url, {"email": self.user_email})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Email already verified", response.data['message'])




    def test_resend_verification_email_invalid_user(self):
        response = self.client.post(self.resend_email_url, {"email": "nonexistent@example.com"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)




    def test_resend_verification_email_throttled(self):
        for _ in range(5):  # 5 allowed requests
            response = self.client.post(self.resend_email_url, {"email": self.user_email})
            self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)  # Should succeed

        # 6th request should be throttled
        response = self.client.post(self.resend_email_url, {"email": self.user_email})
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)  # Should fail




    def test_check_verification_status_unverified_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.check_status_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_verified'])




    def test_check_verification_status_verified_user(self):
        self.user.is_active = True
        self.user.save()
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.check_status_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_verified'])




    def test_subscription_type_set_to_trial_after_verification(self):
        response = self.client.get(self.verify_email_url)
        self.user.refresh_from_db()  
        
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertTrue(self.user.is_active)

        subscription = Subscription.objects.filter(user=self.user).first()
        self.assertIsNotNone(subscription, "Subscription was not created.")
        
        self.assertEqual(subscription.subscription_type, "Trial", "Subscription type is not set to 'Trial'.")
        self.assertTrue(subscription.in_trial, "Subscription is not marked as 'in_trial'.")
        self.assertTrue(subscription.is_active, "Subscription is not marked as active.")