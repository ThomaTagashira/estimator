from django.contrib.auth.models import User
from rest_framework import serializers
from api.models import *
import json
import logging
from dj_rest_auth.registration.serializers import SocialLoginSerializer
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
import re

logger = logging.getLogger(__name__)


class LangchainPgCollectionSearializer(serializers.ModelSerializer):
    class Meta:
        model = LangchainPgCollection
        fields = '__all__'

class LangchainPgEmbeddingSerializer(serializers.ModelSerializer):
    class Meta:
        model = LangchainPgEmbedding
        fields = '__all__'

class MyResponseSerializer(serializers.Serializer):
    response = serializers.CharField()

    def log_serialized_data(self, data):

        if self.is_valid():
            serialized_data = self.validated_data
            logger.info("Serialized Data: %s", serialized_data)
            logger.info("Data Type: %s", type(serialized_data))
        else:
            logger.error("Invalid Data: %s", self.errors)

class JSONFileSerializer(serializers.Serializer):
    json_file = serializers.FileField()

    def validate_json_file(self, value):
        try:
            json.load(value)
        except json.JSONDecodeError:
            raise serializers.ValidationError("Invalid JSON")

        return value

    def create(self, validated_data):

        json_file = validated_data.get('json_file')

        with json_file.open() as file:
            json_data = json.load(file)

        return json_data

class StringListSerializer(serializers.Serializer):
    strings = serializers.ListField(
        child=serializers.CharField(max_length=100000)
    )

    def validate_strings(self, value):
        logger.debug("Validating 'strings' field in StringListSerializer")
        if value is None or len(value) == 0:
            raise serializers.ValidationError(
                f"The 'strings' field cannot be null or empty. Raised in {self.__class__.__name__}."
            )
        return value

class NoteSerializer(serializers.Serializer):
    key = serializers.CharField(max_length=50)
    value = serializers.CharField(max_length=200)

class NoteDictSerializer(serializers.Serializer):
    strings = serializers.DictField(
        child=serializers.CharField(max_length=200)
    )

    def validate_strings(self, value):
        logger.debug("Validating 'strings' field in NoteDictSerializer")
        if not value:
            raise serializers.ValidationError(
                f"The 'strings' field cannot be null or empty. Raised in {self.__class__.__name__}."
            )
        return value

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'username']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},  
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],  
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class CustomGoogleLoginSerializer(SocialLoginSerializer):
    def validate(self, attrs):
        if 'password' in attrs:
            attrs.pop('password')
        return super().validate(attrs)

class ClientDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientData
        fields = ['client_name', 'client_address', 'client_phone', 'client_email']

class ProjectDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectData
        fields = ['project_name', 'project_location', 'start_date', 'end_date']

    def validate_start_date(self, value):
        if not value:
            return None
        return value

    def validate_end_date(self, value):
        if not value:
            return None
        return value

class EstimateItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstimateItems
        fields = ['task_description', 'task_number']

class UserEstimatesSerializer(serializers.ModelSerializer):
    client_data = ClientDataSerializer(many=True, read_only=True) 
    project_data = ProjectDataSerializer(many=True, read_only=True) 
    estimate_items = EstimateItemsSerializer(many=True, read_only=True) 

    class Meta:
        model = UserEstimates
        fields = ['estimate_id', 'date_created', 'last_modified', 'project_name', 'client_data', 'project_data', 'estimate_items']

class BusinessInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessInfo
        fields = ['business_name', 'business_address', 'business_phone', 'business_email']

class SearchResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchResponseData
        fields = ['user', 'estimate', 'task', 'estimate_reference_id', 'saved_response_id']
        read_only_fields = ['saved_response_id']

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("This field is required.")
        user_exists = User.objects.filter(email=value).exists()
        if not user_exists:
            pass
        return value

    def send_reset_email(self, user, request):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_reset_url = f"{settings.FRONTEND_URI}/password-reset-confirm/{uid}/{token}"
        email_subject = "Password Reset Request"
        email_body = (
            f"Hi {user.username},\n\n"
            f"You requested a password reset. Click the link below to reset your password:\n"
            f"{frontend_reset_url}\n\n"
            "If you did not request a password reset, please ignore this email or update your password to secure your account.\n\n"
            "Best regards,\n"
            "YourApp Team"
        )
        send_mail(email_subject, email_body, settings.DEFAULT_FROM_EMAIL, [user.email])

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            uid = urlsafe_base64_decode(data['uid']).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError):
            raise serializers.ValidationError({"uid": "Invalid UID. Please request a new password reset link."})

        if not default_token_generator.check_token(user, data['token']):
            raise serializers.ValidationError({"token": "Invalid or expired token. Please request a new password reset link."})

        data['user'] = user  
        return data

    def save(self, validated_data):
        user = validated_data['user']
        new_password = validated_data['new_password']
        user.set_password(new_password)
        user.save()

class PasswordUpdateSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = self.context['request'].user

        if 'current_password' in data:
            if not user.check_password(data['current_password']):
                raise serializers.ValidationError({"current_password": "Current password is incorrect."})

        new_password = data.get('new_password')
        if len(new_password) < 8:
            raise serializers.ValidationError({"new_password": "Password must be at least 8 characters long."})

        if user.check_password(new_password):
            raise serializers.ValidationError({"new_password": "New password cannot be the same as the old password."})

        return data

    def save(self, user):
        user.set_password(self.validated_data['new_password'])
        user.save()

class EmailUpdateSerializer(serializers.Serializer):
    old_email = serializers.EmailField(required=False)  
    email = serializers.EmailField()

    def validate(self, data):
        print("Context in validate:", self.context)  
        user = self.context['request'].user

        if 'old_email' in data and data['old_email'] != user.email:
            raise serializers.ValidationError({"old_email": "Old email does not match our records."})

        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})

        return data

    def save(self, user):
        old_email = user.email
        user.email = self.validated_data['email']
        user.username = self.validated_data['email']  
        user.save()
        
        EmailChangeHistory.objects.create(
            user=user,
            old_email=old_email,
            new_email=user.email,
        )
        self.send_confirmation_email(user, old_email)

    def send_confirmation_email(self, user, old_email):
        email_subject = "Email Updated Successfully"
        email_body = (
            f"Hi {user.username},\n\n"
            "Your email address has been updated successfully from "
            f"{old_email} to {user.email}. If you did not make this change, "
            "please contact our support team immediately to secure your account.\n\n"
            "Best regards,\n"
            "YourApp Team"
        )
        send_mail(email_subject, email_body, settings.DEFAULT_FROM_EMAIL, [user.email])

class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = ['user_email', 'first_name', 'last_name', 'phone_number', 'zipcode']
        read_only_fields = ['user_email']

    def validate_phone_number(self, value):
        # Example validation: Ensure phone number contains only digits and is of valid length
        if not re.fullmatch(r'^\d{10}$', value): 
            raise serializers.ValidationError("Phone number must be between 10 and 15 digits.")
        return value



