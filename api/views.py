import json, requests, logging, os, stripe
from rest_framework.views import APIView
from util.embedding import get_embedding
from pgvector.django import CosineDistance
from rest_framework.decorators import api_view, permission_classes, throttle_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from util.serializers import *
from util.multi_query_retriever import generate_response
from util.ai_response import get_response
from util.image_encoder import encode_image
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from util.text_converter import image_to_text
from rest_framework.permissions import AllowAny, IsAuthenticated
from dotenv import load_dotenv
import posixpath
from pathlib import Path
from .models import *
from django.utils._os import safe_join
from django.views.static import serve as static_serve
from datetime import timedelta
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from rest_framework.exceptions import ValidationError
from django.utils.timezone import now as timezone_now
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q, Max
from django.core.paginator import Paginator
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from .throttles import ResendEmailThrottle
from .permissions import HasActiveSubscriptionOrTrial, ProfileCompletedPermission
from django.shortcuts import redirect
from urllib.parse import urlencode
from django.urls import reverse
from django.http import HttpResponseNotFound

import logging
logger = logging.getLogger(__name__)



load_dotenv()
logger = logging.getLogger('django')

REDIR_URI = os.getenv('REDIR_URI')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_SECRET_KEY = os.getenv('GOOGLE_SECRET_KEY')

GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_SECRET_KEY = os.getenv('GITHUB_SECRET_KEY')

STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

def serve_react(request, path, document_root=None):
    if path.startswith("api/"):
        return HttpResponseNotFound("API route not found")  

    path = posixpath.normpath(path).lstrip("/")
    fullpath = Path(safe_join(document_root, path))

    if fullpath.is_file():
        return static_serve(request, path, document_root)
    else:
        return static_serve(request, "index.html", document_root)


class ProtectedView(APIView):
    permission_classes = [IsAuthenticated, HasActiveSubscriptionOrTrial, ProfileCompletedPermission]

    def get(self, request):
        return Response({"message": "Access granted to protected content."})
    

@api_view(['GET', 'POST'])
def index(request):
    if request.method == 'POST':
        text = request.data.get('input_text')
        embedding = get_embedding(text)
        document = LangchainPgEmbedding.objects.order_by(CosineDistance('embedding', embedding)).first()
        serializer = LangchainPgEmbeddingSerializer(document)
        return Response(serializer.data)

    elif request.method == 'GET':
        embeddings = LangchainPgEmbedding.objects.all()
        serializer = LangchainPgEmbeddingSerializer(embeddings, many=True)
        return Response(serializer.data)


@api_view(['GET', 'POST'])
def handle_scope(request):
    if request.method == 'POST':
        job_scope = request.data.get('job_scope')
        Line = request.data.get('Line')

        if job_scope:
            return process_job_scope(job_scope)
        elif Line:
            return process_line(Line)
        else:
            return Response({'error': 'Invalid or missing input data'}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        return Response({'message': 'Send a POST request with either job_scope or line parameter'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    else:
        return Response({'error': 'Invalid request method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


def process_job_scope(job_scope):
    query = job_scope
    retriever = generate_response(query)
    response = get_response(retriever, query)
    serializer = MyResponseSerializer(data=response)

    if serializer.is_valid():
        logger.info('Response data: %s', serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        logger.error('Serializer errors: %s', serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def process_line(Line):
    query = Line
    retriever = generate_response(query)
    response = get_response(retriever, query)
    serializer = MyResponseSerializer(data=response)

    if serializer.is_valid():
        logger.info('Response data: %s', serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        logger.error('Serializer errors: %s', serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@csrf_exempt
def upload_photo(request):
    if request.method == 'POST':
        if request.FILES.get('photo'):
            photo = request.FILES['photo']
            base64_photo = encode_image(photo)
            image_text = image_to_text(base64_photo)
            serializer = NoteDictSerializer(data={'strings': image_text})

            if serializer.is_valid():
                logger.info('Response data: %s', serializer.data)
                print("valid: ", serializer.validated_data)
                response_data = serializer.data
                json_response_data = json.dumps(response_data, indent=4)
                return JsonResponse(json_response_data, safe=False)

            else:
                logger.error('Serializer errors: %s', serializer.errors)
                # print("invalid: ", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'No photo provided'}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        return Response({'message': 'Send a POST request with a Photo'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    else:
        return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)\


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def register_user(request):
    try:
        email = request.data.get('userEmail', '').lower()  
        password = request.data.get('password')

        if not email:
            return Response({'email': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        validate_email(email)

        if User.objects.filter(email__iexact=email).exists():
            return Response({'email': 'Email already in use.'}, status=status.HTTP_400_BAD_REQUEST)

        validate_password(password)

        with transaction.atomic():
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                is_active=False  
            )

            send_verification_email(user)  # ✅ If this fails, it will log an error

        return Response({'message': 'Registration successful. Please verify your email to proceed.'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"🔥 ERROR in register_user: {str(e)}", exc_info=True)  # ✅ Full stack trace
        return Response({'error': 'Something went wrong on our end.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
def generate_verification_token(email):
    return serializer.dumps(email, salt='email-verify-salt')


def send_verification_email(user):
    token = generate_verification_token(user.email)
    verification_url = f"{settings.BACKEND_URI}/api/verify-email/{token}"

    subject = "Welcome to FairBuild!"
    message = f"Hi {user.username},\n\nPlease verify your email by clicking the link below:\n{verification_url}\n\nThank you! This link is only valid for 15 minutes."
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]

    send_mail(subject, message, from_email, recipient_list)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([ResendEmailThrottle])
def resend_verification_email(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        if user.is_active:
            logger.info(f"User {user.email} attempted to resend a verification email but is already verified.")
            return Response({'message': 'Email already verified.'}, status=status.HTTP_200_OK)

        send_verification_email(user)
        logger.info(f"Verification email resent to {user.email}.")
        return Response({'message': 'Verification email resent.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        logger.warning(f"Resend verification email attempted for non-existent email: {email}.")
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


def confirm_verification_token(token, expiration=3600):
    try:
        email = serializer.loads(token, salt='email-verify-salt', max_age=expiration)
        print("Decoded email:", email)  # Debugging

        return email
    except SignatureExpired:
        print("Token expired in confirm_verification_token")
        return None  
    except BadSignature:
        print("Invalid token in confirm_verification_token")
        return None  


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def verify_email(request, token):
    logger.debug(f"Received token: {token}")  # ✅ Log the token
    email = confirm_verification_token(token)
    
    if not email:
        logger.warning("Token invalid or expired")
        return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)

        if user.is_active:
            print(f"User {user.email} is already active.")
            return redirect(f'{REDIR_URI}/verify-email-success?email={email}')

        user.is_active = True
        user.save()
        print(f"User {user.email} activated.")

        stripe_profile, stripe_created = StripeProfile.objects.get_or_create(
            user=user,
            defaults={
                'stripe_customer_id': stripe.Customer.create(email=user.email)['id']
            }
        )
        if stripe_created:
            print(f"Stripe profile created for {user.email}.")
        else:
            print(f"Stripe profile already exists for {user.email}.")

        subscription, created = Subscription.objects.get_or_create(
            user=user,
            defaults={
                'is_active': True,
                'trial_start_date': timezone_now(),
                'trial_end_date': timezone_now() + timedelta(days=7),
                'in_trial': True,
                'subscription_type': 'Trial'
            }
        )
        if not created and not subscription.is_active:
            subscription.is_active = True
            subscription.in_trial = True
            subscription.trial_start_date = now()
            subscription.trial_end_date = now() + timedelta(days=7)
            subscription.subscription_type = 'Trial'
            subscription.save()
            print(f"Updated subscription for {user.email}.")

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        query_params = urlencode({
            'email': email,
            'access': access_token,
            'refresh': str(refresh),
            'has_active_subscription': str(subscription.is_active).lower(),  
            'in_trial': str(subscription.in_trial).lower(), 
            'trial_end_date': subscription.trial_end_date.isoformat(),
        })
        redirect_url = f'{REDIR_URI}/verify-email-success?{query_params}'

        logger.info(f"Final Redirect URL: {redirect_url}")

        return redirect(redirect_url)

    except User.DoesNotExist:
        print(f"User with email {email} does not exist.")
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def check_verification_status(request):
    user = request.user
    return Response({'is_verified': user.is_active}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            if user:
                serializer.send_reset_email(user, request)
            return Response({'message': 'If this email is registered, a reset link has been sent.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(serializer.validated_data)
            return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def generate_email_update_verification_token(old_email, new_email):
    return serializer.dumps({'old_email': old_email, 'new_email': new_email}, salt='email-verify-salt')


def confirm_email_update_verification_token(token, expiration=3600):
    try:
        data = serializer.loads(token, salt='email-verify-salt', max_age=expiration)
        return data  
    except SignatureExpired:
        print("Token expired in confirm_verification_token")
        return None
    except BadSignature:
        print("Invalid token in confirm_verification_token")
        return None
    

class EmailUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Request data:", request.data)  
        serializer = EmailUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            new_email = serializer.validated_data['email']
            token = generate_email_update_verification_token(request.user.email, new_email)

            verification_url = f"{settings.BACKEND_URI}/api/confirm-user-updated-email/{token}"
            email_subject = "Confirm Your Email Address Change"
            email_body = (
                f"Hi {request.user.username},\n\n"
                f"To confirm your email change to {new_email}, please click the link below:\n"
                f"{verification_url}\n\n"
                "If you did not request this change, please ignore this email.\n\n"
                "Best regards,\nYourApp Team"
            )
            send_mail(email_subject, email_body, settings.DEFAULT_FROM_EMAIL, [new_email])

            return Response({'message': 'Verification email sent. Please confirm your new email.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
class ConfirmEmailChangeView(APIView):
    permission_classes = [AllowAny] 

    def get(self, request, token):
        data = confirm_verification_token(token)
        print('Decoded data: ', data)
        if not data:
            return redirect(f"{settings.FRONTEND_URI}/verify-email-failed")

        old_email = data.get('old_email')
        new_email = data.get('new_email')

        try:
            user = User.objects.get(email=old_email)
            user.email = new_email
            user.username = new_email
            user.save()

            Subscription.objects.filter(user_email=user).update(user_email=new_email)

            query_params = urlencode({'email': new_email, 'success': True})

            return redirect(f"{settings.FRONTEND_URI}/verify-user-email-success?{query_params}")

        except User.DoesNotExist:
            return redirect(f"{settings.FRONTEND_URI}/verify-email-failed")


class PasswordUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(request.user)
            return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_info = UserInfo.objects.get(user=request.user)
        except UserInfo.DoesNotExist:
            return Response({'error': 'User info not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserInfoSerializer(user_info)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        try:
            user_info = UserInfo.objects.get(user=request.user)
        except UserInfo.DoesNotExist:
            return Response({'error': 'User info not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserInfoSerializer(user_info, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST', 'PATCH'])
@permission_classes([IsAuthenticated])
def save_user_data(request):
    logger.debug(f"Incoming data: {request.data}")

    user = request.user

    user_data = request.data.get('user_data', {})

    user_info, created = UserInfo.objects.get_or_create(user=user)

    if request.method in ['POST', 'PATCH']:
        serializer = UserInfoSerializer(user_info, data=user_data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            return Response(serializer.data, status=response_status)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@authentication_classes([])
@permission_classes([AllowAny])
def check_trial_status(user):
    subscription = user.subscription
    if subscription.in_trial and subscription.trial_end_date < timezone.now():
        subscription.in_trial = False
        subscription.save()


@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def subscription_status(request):
    user = request.user
    response_data = {
        'has_active_subscription': False,
        'in_trial': False,
        'trial_end_date': None,
    }

    if user.is_authenticated:
        try:
            subscription = Subscription.objects.get(user=user)
            response_data['has_active_subscription'] = subscription.is_active
            response_data['in_trial'] = subscription.in_trial
            response_data['trial_end_date'] = subscription.trial_end_date

            if subscription.in_trial and subscription.trial_end_date < timezone.now():
                subscription.in_trial = False
                subscription.save()
                response_data['in_trial'] = False
                logger.debug('Trial period ended for user: %s', user.username)

            logger.debug('Subscription data: %s', response_data)
        except Subscription.DoesNotExist:
            logger.debug('No subscription found for user: %s', user.username)
    else:
        logger.debug('Unauthenticated access to subscription status.')

    return Response(response_data)


class UserStateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'User is not authenticated'}, status=401)

        subscription = getattr(user, 'subscription', None)
        return Response({
            'is_active': subscription.is_active if subscription else False,
            'in_trial': subscription.in_trial if subscription else False,
            'profile_completed': subscription.profile_completed if subscription else False,
            'is_account_OAuth': subscription.is_account_OAuth if subscription else False,
        })


class UsernameTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '').lower()

        if not username:
            return Response(
                {'detail': "Username is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username__iexact=username)

            if not user.is_active:
                return Response(
                    {'detail': "Email not verified. Please verify your email to proceed."},
                    status=status.HTTP_403_FORBIDDEN
                )

            subscription = Subscription.objects.filter(user=user).first()
            active_subscription = subscription.is_active if subscription else False
            profile_completed = subscription.profile_completed if subscription else False
            in_trial = subscription.in_trial if subscription else False

            if not active_subscription:
                return Response(
                    {'detail': "Subscription required."},
                    status=status.HTTP_403_FORBIDDEN
                )

        except User.DoesNotExist:
            return Response(
                {'detail': "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        response = super().post(request, *args, **kwargs)
        response.data['has_active_subscription'] = active_subscription
        response.data['profile_completed'] = profile_completed
        response.data['in_trial'] = in_trial

        return response


class GoogleTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')

        if not username:
            return Response(
                {'detail': 'Username is required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'detail': "Invalid credentials."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        subscription = Subscription.objects.filter(user=user).first()
        active_subscription = subscription.is_active if subscription else False
        profile_completed = subscription.profile_completed if subscription else False

        return Response({
            'refresh': str(refresh),
            'access': access,
            'has_active_subscription': active_subscription,
            'profile_completed': profile_completed,
        })


class GoogleLoginView(APIView):
    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Authorization code is missing'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token_response = requests.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': GOOGLE_CLIENT_ID,
                    'client_secret': GOOGLE_SECRET_KEY,
                    'redirect_uri': f'{REDIR_URI}/google-callback',
                    'grant_type': 'authorization_code'
                },
                timeout=10
            )
            token_response.raise_for_status()
            token_data = token_response.json()
        except requests.exceptions.RequestException as e:
            return Response({'error': f'Failed to exchange token: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        access_token = token_data.get('access_token')
        id_token = token_data.get('id_token')

        if not access_token or not id_token:
            return Response({'error': 'Invalid token response'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_info_response = requests.get(
                'https://www.googleapis.com/oauth2/v1/userinfo',
                params={'access_token': access_token},
                timeout=10
            )
            user_info_response.raise_for_status()
            user_info = user_info_response.json()
        except requests.exceptions.RequestException as e:
            return Response({'error': f'Failed to fetch user info: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        email = user_info.get('email')
        if not email:
            return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)

        email = email.lower()  

        with transaction.atomic():
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                user = User.objects.create_user(username=email, email=email, is_active=True)

            if not StripeProfile.objects.filter(user=user).exists():
                try:
                    customer = stripe.Customer.create(email=user.email)
                    StripeProfile.objects.create(user=user, stripe_customer_id=customer['id'])
                except Exception as e:
                    user.delete()  
                    return Response({'error': f'Failed to create Stripe customer: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            Subscription.objects.get_or_create(
                user=user,
                defaults={
                    'is_account_OAuth': True,
                    'is_active': True,
                    'trial_start_date': timezone_now(),
                    'trial_end_date': timezone_now() + timedelta(days=7),
                    'in_trial': True,
                    'subscription_type': 'Trial'
                }
            )

        try:
            refresh = RefreshToken.for_user(user)
            jwt_access_token = str(refresh.access_token)
            jwt_refresh_token = str(refresh)
        except Exception as e:
            return Response({'error': f'Failed to generate JWT: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        subscription = Subscription.objects.filter(user=user).first()
        has_active_subscription = subscription.is_active if subscription else False
        in_trial = subscription.in_trial if subscription else False
        profile_completed = subscription.profile_completed if subscription else False

        return Response({
            'access': jwt_access_token,
            'refresh': jwt_refresh_token,
            'has_active_subscription': has_active_subscription,
            'in_trial': in_trial,
            'profile_completed': profile_completed,
            'is_account_OAuth': True
        }, status=status.HTTP_200_OK)


class CompleteProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            subscription = Subscription.objects.get(user=request.user)
        except Subscription.DoesNotExist:
            return Response({'error': 'No subscription found'}, status=404)

        if not subscription.profile_completed:
            subscription.profile_completed = True
            subscription.save()
        else:
            return Response({'message': 'Profile already completed'}, status=400)

        user_token, created = UserToken.objects.get_or_create(user=request.user)
        user_token.token_balance += 15  # Trial gift tokens
        user_token.save()

        return Response({
            'message': 'Profile completed and tokens distributed',
            'token_balance': user_token.token_balance,
            'last_updated': user_token.last_updated.isoformat(),
        })


# class GitHubLoginView(APIView):
#     def post(self, request, *args, **kwargs):
#         code = request.data.get('code')
#         if not code:
#             return Response({'error': 'Authorization code is missing'}, status=status.HTTP_400_BAD_REQUEST)
#         token_response = requests.post(
#             'https://github.com/login/oauth/access_token',
#             data={
#                 'client_id': GITHUB_CLIENT_ID,
#                 'client_secret': GITHUB_SECRET_KEY,
#                 'code': code,
#                 'redirect_uri': f'{REDIR_URI}/github-callback',
#             },
#             headers={'Accept': 'application/json'}
#         )

#         token_data = token_response.json()

#         if 'error' in token_data:
#             return Response({'error': token_data['error_description']}, status=status.HTTP_400_BAD_REQUEST)

#         access_token = token_data.get('access_token')

#         return Response({
#             'access_token': access_token,
#         }, status=status.HTTP_200_OK)


class CreateSubscriptionCheckoutSessionView(APIView):

    def post(self, request):
        user = request.user

        stripe_profile, created = StripeProfile.objects.get_or_create(user=user)

        if not stripe_profile.stripe_customer_id:
            try:
                customer = stripe.Customer.create(email=user.email)
                stripe_profile.stripe_customer_id = customer['id']
                stripe_profile.save()
            except Exception as e:
                logger.error(f"Failed to create Stripe customer: {str(e)}")
                return Response({'error': f'Failed to create Stripe customer: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        subscription_tier = request.data.get('tier')
        if not subscription_tier:
            return Response({'error': 'Subscription tier is required'}, status=status.HTTP_400_BAD_REQUEST)

        SUBSCRIPTION_PRICE_MAP = os.getenv('SUBSCRIPTION_PRICE_MAP')
        SUBSCRIPTION_PRICE_MAP = json.loads(SUBSCRIPTION_PRICE_MAP)

        price_id = SUBSCRIPTION_PRICE_MAP.get(subscription_tier)
        if not price_id:
            return Response({'error': 'Invalid subscription tier'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='subscription',
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                success_url=f'{REDIR_URI}/success',
                cancel_url=f'{REDIR_URI}/cancel',
                customer=stripe_profile.stripe_customer_id
            )
            return JsonResponse({'sessionId': session.id})
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


def handle_checkout_session_completed(session):
    logger.info("Handling checkout.session.completed")
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')  

    if not customer_id or not subscription_id:
        logger.error("Customer ID or Subscription ID is None, skipping processing.")
        return

    try:
        user = User.objects.get(profile__stripe_customer_id=customer_id)
        logger.info(f"Processing user: {user.username}")

        if user.is_staff or user.is_superuser or getattr(user.profile, 'is_exempt', False):
            logger.info(f"Skipping processing for exempt user: {user.username}")
            return

        user.is_active = True
        user.save()

        subscription, created = Subscription.objects.get_or_create(
            user=user,
            defaults={'stripe_subscription_id': subscription_id}  
        )
        if created:
            logger.info(f"New subscription created for user: {user.username}")
        else:
            logger.info(f"Existing subscription found for user: {user.username}")

            if subscription.stripe_subscription_id != subscription_id:
                subscription.stripe_subscription_id = subscription_id

        subscription.is_active = True

        line_items = session.get('lines', {}).get('data', [])
        logger.info(f"Line items: {line_items}")

        for item in line_items:
            price = item.get('price', {})
            product_id = price.get('product')
            logger.info(f"Product ID: {product_id}")

            PRODUCT_TYPE_MAP = json.loads(os.getenv('PRODUCT_TYPE_MAP', '{}'))
            subscription_type = PRODUCT_TYPE_MAP.get(product_id)

            if not subscription_type:
                logger.error(f"Unknown Product ID: {product_id}. Skipping token allocation.")
                continue

            TOKEN_ALLOCATION_MAP = json.loads(os.getenv('TOKEN_ALLOCATION_MAP', '{}'))
            tokens_to_add = int(TOKEN_ALLOCATION_MAP.get(subscription_type, 0))

            subscription.subscription_type = subscription_type
            subscription.token_allocation = tokens_to_add
            subscription.cancellation_pending=False
            subscription.last_payment_date = now()
            subscription.auto_renew = True
            subscription.save()

            user_token, _ = UserToken.objects.get_or_create(user=user)
            user_token.token_balance += tokens_to_add
            user_token.save()

        subscription.last_token_allocation_date = now()
        subscription.save()

        logger.info(f"Subscription set up for user: {user.username}, tokens added: {tokens_to_add}")

    except User.DoesNotExist:
        logger.error(f"No user found for customer ID: {customer_id}")
    except Exception as e:
        logger.error(f"Error processing checkout.session.completed: {e}")


def handle_invoice_payment_succeeded(invoice):
    logger.info("Handling invoice.payment_succeeded")
    customer_id = invoice.get('customer')
    subscription_id = invoice.get('subscription')
    invoice_id = invoice.get('id')

    if not customer_id or not subscription_id:
        logger.error("Customer ID or Subscription ID is missing, skipping processing.")
        return

    try:
        user = User.objects.get(profile__stripe_customer_id=customer_id)
        subscription, created = Subscription.objects.get_or_create(user=user)

        if created:
            logger.info(f"New subscription created for user: {user.username}")

        if subscription.stripe_subscription_id != subscription_id:
            logger.info(f"Updating subscription ID for user: {user.username}")
            subscription.stripe_subscription_id = subscription_id

        if subscription.last_processed_invoice_id == invoice_id:
            logger.info(f"Invoice {invoice_id} already processed for user: {user.username}. Skipping.")
            return

        subscription.is_active = True
        subscription.last_payment_date = now()
        subscription.last_processed_invoice_id = invoice_id

        line_items = invoice.get('lines', {}).get('data', [])
        for item in line_items:
            price = item.get('price', {})
            product_id = price.get('product')

            try:
                PRODUCT_TYPE_MAP = json.loads(os.getenv('PRODUCT_TYPE_MAP', '{}'))
                TOKEN_ALLOCATION_MAP = json.loads(os.getenv('TOKEN_ALLOCATION_MAP', '{}'))
            except json.JSONDecodeError as e:
                logger.error(f"Error decoding environment variables: {e}")
                return

            subscription_type = PRODUCT_TYPE_MAP.get(product_id)

            if not subscription_type:
                logger.error(f"Unknown Product ID: {product_id}. Skipping token allocation.")
                continue

            tokens_to_add = int(TOKEN_ALLOCATION_MAP.get(subscription_type, 0))

            subscription.subscription_type = subscription_type
            subscription.token_allocation = tokens_to_add
            subscription.cancellation_pending = False
            subscription.auto_renew = True

            user_token, _ = UserToken.objects.get_or_create(user=user)
            user_token.token_balance += tokens_to_add
            user_token.save()

            logger.info(f"Tokens added for user: {user.username}, tokens: {tokens_to_add}")

        subscription.save()

    except User.DoesNotExist:
        logger.error(f"No user found for customer ID: {customer_id}")
    except Exception as e:
        logger.error(f"Error processing invoice.payment_succeeded: {e}")


class ChangeSubscriptionTierView(APIView):
    def post(self, request):
        try:
            logger.info(f"Request data: {request.data}")
            new_tier = request.data.get('newTier')

            if not new_tier:
                raise ValidationError({'error': 'Subscription tier is required'})

            TOKEN_ALLOCATION_MAP = json.loads(os.getenv('TOKEN_ALLOCATION_MAP', '{}'))
            tier_data = TOKEN_ALLOCATION_MAP.get(new_tier)

            if not tier_data:
                logger.error(f"Invalid subscription tier: {new_tier}")
                raise ValidationError({'error': 'Invalid subscription tier'})


            stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
            session = stripe.checkout.Session.create(
                customer=request.user.profile.stripe_customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price': tier_data['stripe_price_id'],
                    'quantity': 1,
                }],
                mode='subscription',
                subscription_data={
                    'proration_behavior': 'none', 
                },
                success_url=f'{REDIR_URI}/success',
                cancel_url=f'{REDIR_URI}/cancel',
            )

            logger.info(f"Stripe session created: {session['id']}")
            return Response({
                'sessionId': session['id'],
                'newTier': new_tier,
                'priceId': tier_data['stripe_price_id'],
            }, status=200)

        except ValidationError as e:
            logger.error(f"Validation error: {str(e)}")
            return Response({'error': str(e.detail)}, status=400)
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return Response({'error': 'An error occurred with Stripe'}, status=500)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return Response({'error': str(e)}, status=500)


class CreateTokenCheckoutSessionView(APIView):
    def post(self, request):
        user = request.user  
        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)

        try:
            subscription = Subscription.objects.get(user=user, is_active=True)
        except Subscription.DoesNotExist:
            return Response({'error': 'Active subscription required to purchase tokens'}, status=403)

        try:
            stripe_profile = StripeProfile.objects.get(user=user)
            if not stripe_profile.stripe_customer_id:
                return Response({'error': 'Stripe customer ID is missing. Contact support.'}, status=400)
        except StripeProfile.DoesNotExist:
            return Response({'error': 'Stripe profile not found. Contact support.'}, status=400)

        token_amount = request.data.get('tokenQty')
        TOKEN_PRICE_MAP = os.getenv('TOKEN_PRICE_MAP')
        TOKEN_PRICE_MAP = json.loads(TOKEN_PRICE_MAP)

        price_id = TOKEN_PRICE_MAP.get(token_amount)
        if not price_id:
            return Response({'error': 'Invalid token amount'}, status=400)

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='payment',
                customer=stripe_profile.stripe_customer_id,  
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                metadata={
                    'type': 'token_purchase',  
                    'tokenQty': token_amount,  
                },
                success_url=f'{REDIR_URI}/success',
                cancel_url=f'{REDIR_URI}/cancel',
            )
            return Response({'sessionId': session.id})
        except Exception as e:
            logger.error(f"Error creating Stripe checkout session: {str(e)}")
            return Response({'error': str(e)}, status=400)


def handle_token_purchase(session):
    stripe_customer_id = session.get('customer')
    logger.info(f"Received customer data: {session.get('customer')}")

    metadata = session.get('metadata', {})
    token_qty = metadata.get('tokenQty')
    logger.info(f"Received session metadata: {session.get('metadata', {})}")
    logger.info(f"Received metadata tokenQty: {metadata.get('tokenQty')}")

    if not stripe_customer_id or not token_qty:
        logger.error("Missing customer ID or token quantity in session metadata.")
        return

    try:
        user = User.objects.get(profile__stripe_customer_id=stripe_customer_id)
        logger.info(f"Adding {token_qty} tokens to user {user.username}")
        user_token, created = UserToken.objects.get_or_create(user=user)
        user_token.token_balance += int(token_qty)
        user_token.save()
        logger.info(f"New token balance for user {user.username}: {user_token.token_balance}")
    except User.DoesNotExist:
        logger.error(f"No user found with Stripe customer ID: {stripe_customer_id}")
    except Exception as e:
        logger.error(f"Error updating token balance for user: {e}")


class CancelSubscriptionView(APIView):
    """
    Allows a user to cancel their subscription at the end of the billing cycle.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            with transaction.atomic():
                subscription = Subscription.objects.select_for_update().get(user=request.user, is_active=True)

                if subscription.stripe_subscription_id:
                    stripe.Subscription.modify(
                        subscription.stripe_subscription_id,
                        cancel_at_period_end=True
                    )

                subscription.cancellation_pending = True
                subscription.end_date = subscription.last_payment_date + timedelta(days=30)
                subscription.auto_renew = False
                subscription.save()

                return JsonResponse({
                    'message': 'Subscription cancellation requested successfully. Your access will continue until the end of the billing cycle.',
                    'end_date': subscription.end_date,
                })

        except Subscription.DoesNotExist:
            return JsonResponse({'error': 'No active subscription found.'}, status=404)

        except stripe.error.StripeError as e:
            return JsonResponse({'error': f'Stripe error: {str(e)}'}, status=500)

        except Exception as e:
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)


def handle_cancel_subscription(subscription_data):
    """
    Handles the cancellation of a subscription when notified by Stripe.
    """
    customer_id = subscription_data.get('customer')
    subscription_id = subscription_data.get('id')

    if not customer_id or not subscription_id:
        logger.error("Missing customer ID or subscription ID in webhook data.")
        return False

    try:
        user = User.objects.get(profile__stripe_customer_id=customer_id)
        subscription = Subscription.objects.get(user=user, stripe_subscription_id=subscription_id)

        subscription.is_active = False
        subscription.cancellation_pending = False
        subscription.save()

        logger.info(f"Subscription {subscription_id} for user {user.username} has been finalized.")
        return True

    except User.DoesNotExist:
        logger.error(f"No user found for Stripe customer ID: {customer_id}")
    except Subscription.DoesNotExist:
        logger.error(f"No subscription found for Stripe subscription ID: {subscription_id}")
    except Exception as e:
        logger.error(f"Error finalizing subscription cancellation: {e}")
    return False


@csrf_exempt
@api_view(['POST'])
def stripe_webhook(request):
    payload = request.body.decode('utf-8')
    logger.info(f"Raw payload (truncated): {payload[:500]}")

    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    if not webhook_secret:
        logger.error("Stripe webhook secret is not configured.")
        return JsonResponse({'status': 'error', 'message': 'Server misconfiguration'}, status=500)

    try:
        event = stripe.Webhook.construct_event(
            payload, request.META['HTTP_STRIPE_SIGNATURE'], webhook_secret
        )
        logger.info(f"Stripe event constructed successfully: {event['type']}")
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        return JsonResponse({'status': 'error', 'message': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        return JsonResponse({'status': 'error', 'message': 'Invalid signature'}, status=400)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return JsonResponse({'status': 'error', 'message': 'Unexpected error'}, status=400)

    event_type = event['type']
    event_data = event['data']['object']
    logger.info(f"Processing event type: {event_type}")

    if event_type == 'customer.subscription.updated':
        handle_invoice_payment_succeeded(event_data)

    elif event_type == 'customer.subscription.deleted':
        success = handle_cancel_subscription(event_data)
        logger.info(f"Subscription {event_data['id']} was canceled.")
        if not success:
            return JsonResponse({'status': 'error', 'message': 'Failed to cancel subscription'}, status=500)

    elif event_type == 'checkout.session.completed':
        session = event_data
        if session.get('mode') == 'subscription':
            handle_checkout_session_completed(session)
        elif session.get('mode') == 'payment' and session.get('metadata', {}).get('type') == 'token_purchase':
            handle_token_purchase(session)

    elif event_type == 'invoice.payment_succeeded':
        handle_invoice_payment_succeeded(event_data)

    elif event_type == 'invoice.payment_failed':
        handle_payment_failed(event_data)

    else:
        logger.warning(f"Unhandled event type received: {event_type}")

    return JsonResponse({'status': 'success'})


def handle_payment_failed(event):
    subscription_id = event['data']['object']['subscription']

    try:
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription.is_active = False
        subscription.save()

        user_email = subscription.user.email

        send_mail(
            subject="Subscription Payment Failed",
            message=f"Greetings,\n\nWe encountered an issue processing your subscription payment. "
                    f"Please update your payment information to continue enjoying our services.\n\n"
                    f"Visit your account: (add URL to app here)",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )

    except Subscription.DoesNotExist:
        logger.error(f"Subscription with ID {subscription_id} does not exist.")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")


def user_estimate_view(request):
    user = request.user
    estimates = UserEstimates.objects.filter(user=user).select_related('project_data', 'estimate_items', 'client_data')

    context = {
        'estimates': estimates
    }

    return context


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_estimate(request):
    data = request.data
    user = request.user

    try:
        estimate = UserEstimates.objects.create(user=user)
        # print(f"Created estimate with ID: {estimate.estimate_id}") 

        client_data = data.get('client', {})
        # print(f"Client Data: {client_data}")  
        ClientData.objects.create(
            user=user,
            estimate=estimate,
            client_name=client_data.get('clientName'),
            client_address=client_data.get('clientAddress'),
            client_phone=client_data.get('clientPhone'),
            client_email=client_data.get('clientEmail'),
        )

        project_data = data.get('project', {})
        # print(f"Project Data: {project_data}") 
        ProjectData.objects.create(
            user=user,
            estimate=estimate,
            project_name=project_data.get('projectName'),
            project_location=project_data.get('projectLocation'),
            start_date=project_data.get('startDate'),
            end_date=project_data.get('endDate'),
        )

        return JsonResponse({
            'estimate_id': estimate.estimate_id,
            'client_name': client_data.get('clientName'),
            'project_name': project_data.get('projectName'),
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        # print(f"Error creating estimate: {e}")  
        return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_estimates(request):
    user = request.user
    search_query = request.query_params.get('search', '')
    limit = int(request.query_params.get('limit', 10))  
    offset = int(request.query_params.get('offset', 0))  

    estimates = UserEstimates.objects.filter(user=user)
    if search_query:
        estimates = estimates.filter(
            Q(estimate_id__icontains=search_query) | Q(project_name__icontains=search_query)
        )

    estimates = estimates.order_by('estimate_id')

    paginator = Paginator(estimates, limit)
    page_number = offset // limit + 1  
    page = paginator.get_page(page_number)

    serializer = UserEstimatesSerializer(page.object_list, many=True)
    return Response({
        'estimates': serializer.data,
        'total': paginator.count,  
        'page': page_number,
        'total_pages': paginator.num_pages,
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_estimate(request, estimate_id):
    try:
        # print(f"Received DELETE request for estimate_id: {estimate_id}")
        estimate = UserEstimates.objects.get(estimate_id=estimate_id, user=request.user)
        estimate.delete()
        # print(f"Successfully deleted estimate_id: {estimate_id}")
        return Response(status=status.HTTP_204_NO_CONTENT)
    except UserEstimates.DoesNotExist:
        # print(f"Estimate_id {estimate_id} not found or already deleted.")
        return Response({'error': 'Estimate not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_estimate(request, estimate_id):
    try:
        estimate = UserEstimates.objects.get(estimate_id=estimate_id, user=request.user)

        client_data = estimate.client_data.all()
        project_data = estimate.project_data.all()

        response_data = {
            'estimate_id': estimate.estimate_id,
            'project_name': estimate.project_name,
            'client_data': ClientDataSerializer(client_data, many=True).data,
            'project_data': ProjectDataSerializer(project_data, many=True).data,
        }

        print("Response Data:", response_data)

        return Response(response_data)
    except UserEstimates.DoesNotExist:
        return Response({'error': 'Estimate not found'}, status=404)
    except Exception as e:
        # print("Error:", e)
        return Response({'error': str(e)}, status=500)


class SaveEstimateItems(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        estimate_id = request.data.get('estimate_id')
        tasks = request.data.get('tasks')
        user = request.user

        try:
            estimate = UserEstimates.objects.get(estimate_id=estimate_id, user=user)
        except UserEstimates.DoesNotExist:
            return Response({'error': 'Estimate not found'}, status=status.HTTP_404_NOT_FOUND)

        current_max_task_number = EstimateItems.objects.filter(estimate=estimate).aggregate(
            max_task_number=Max('task_number')
        )['max_task_number'] or 0

        saved_tasks = []  

        for task in tasks:
            current_max_task_number += 1
            task_description = f"{task['job']} Labor Cost: ${task['laborCost']} Material Cost: ${task['materialCost']}"

            estimate_item = EstimateItems.objects.create(
                user=user,
                estimate=estimate,
                task_number=current_max_task_number,
                task_description=task_description
            )

            saved_tasks.append({
                'task_number': estimate_item.task_number,
                'task_description': estimate_item.task_description,
            })

        return Response({'message': 'Tasks saved successfully', 'tasks': saved_tasks}, status=status.HTTP_201_CREATED)


class FetchEstimateItems(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, estimate_id):
        try:
            estimate = UserEstimates.objects.get(estimate_id=estimate_id, user=request.user)
        except UserEstimates.DoesNotExist:
            return Response({'error': 'Estimate not found'}, status=status.HTTP_404_NOT_FOUND)

        tasks = EstimateItems.objects.filter(estimate=estimate).order_by('task_number')

        task_data = [
            {
                'task_number': task.task_number,
                'task_description': task.task_description
            } for task in tasks
        ]

        return Response(task_data, status=status.HTTP_200_OK)


class UpdateTaskView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, estimate_id, task_number):
        task_description = request.data.get('task_description')

        try:
            task = EstimateItems.objects.get(estimate_id=estimate_id, task_number=task_number)
        except EstimateItems.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        task.task_description = task_description
        task.save()

        return Response({'message': 'Task updated successfully'}, status=status.HTTP_200_OK)


class DeleteTaskView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, estimate_id, task_number):
        try:
            task = EstimateItems.objects.get(estimate_id=estimate_id, task_number=task_number)
            task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except EstimateItems.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)


class UpdateEstimateInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, estimate_id):
        updated_client_info = request.data.get('client_data')
        updated_project_info = request.data.get('project_data')

        try:
            client_info = ClientData.objects.get(estimate__estimate_id=estimate_id)
            if updated_client_info:
                client_info.client_name = updated_client_info.get('client_name', client_info.client_name)
                client_info.client_address = updated_client_info.get('client_address', client_info.client_address)
                client_info.client_phone = updated_client_info.get('client_phone', client_info.client_phone)
                client_info.client_email = updated_client_info.get('client_email', client_info.client_email)
                client_info.save()
        except ClientData.DoesNotExist:
            return Response({'error': 'Client data not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            project_info = ProjectData.objects.get(estimate__estimate_id=estimate_id)
            if updated_project_info:
                project_info.project_name = updated_project_info.get('project_name', project_info.project_name)
                project_info.project_location = updated_project_info.get('project_location', project_info.project_location)
                project_info.start_date = updated_project_info.get('start_date', project_info.start_date)
                project_info.end_date = updated_project_info.get('end_date', project_info.end_date)
                project_info.save()
        except ProjectData.DoesNotExist:
            return Response({'error': 'Project data not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'message': 'Estimate information updated successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_business_info(request):
    business_data = request.data
    user = request.user

    business_info, created = BusinessInfo.objects.get_or_create(user=user)

    business_info.business_name = business_data.get('business_name', business_info.business_name)
    business_info.business_address = business_data.get('business_address', business_info.business_address)
    business_info.business_phone = business_data.get('business_phone', business_info.business_phone)
    business_info.business_email = business_data.get('business_email', business_info.business_email)
    
    business_info.save()

    response_data = {
        'business_name': business_info.business_name,
        'business_address': business_info.business_address,
        'business_phone': business_info.business_phone,
        'business_email': business_info.business_email,
    }

    return Response(
        response_data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_business_info(request):
    business_infos = BusinessInfo.objects.filter(user=request.user)
    serializer = BusinessInfoSerializer(business_infos, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_token_count(request):
    try:
        user_token = UserToken.objects.get(user=request.user)
        return Response({'token_balance': user_token.token_balance})
    
    except UserToken.DoesNotExist:
        return Response({'error': 'Token balance not found for user'}, status=404)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deduct_tokens(request):
    try:
        user_token = UserToken.objects.get(user=request.user)
        tokens_to_deduct = int(request.data.get('tokens', 0))
        if user_token.token_balance < tokens_to_deduct:
            return Response({'error': 'Insufficient tokens'}, status=400)

        user_token.token_balance -= tokens_to_deduct
        user_token.save()
        return Response({'new_token_balance': user_token.token_balance})
    except UserToken.DoesNotExist:
        return Response({'error': 'Token balance not found'}, status=404)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_subscription_tier(request):
    try:
        subscription_tier = Subscription.objects.get(user=request.user)
        return Response({'subscription tier': subscription_tier.subscription_type})
    
    except Subscription.DoesNotExist:
        return Response({'error': 'User subscription not found'}, status=404)
    

class SaveSearchResponseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, estimate_id):
        user = request.user
        search_responses = request.data.get('search_responses', [])

        try:
            estimate = UserEstimates.objects.get(estimate_id=estimate_id, user=user)
        except UserEstimates.DoesNotExist:
            return Response({'error': 'Estimate not found'}, status=status.HTTP_404_NOT_FOUND)

        current_max_saved_response_id = SearchResponseData.objects.filter(estimate=estimate).aggregate(
            max_saved_response_id=Max('saved_response_id')
        )['max_saved_response_id'] or 0

        saved_responses = [] 

        for response in search_responses:
            current_max_saved_response_id += 1
            task_text = response.get('task')

            if not task_text:
                return Response({'error': 'Each response must contain a "task" field'}, status=status.HTTP_400_BAD_REQUEST)

            search_response = SearchResponseData.objects.create(
                user=user,
                estimate=estimate,
                task=task_text,
                saved_response_id=current_max_saved_response_id
            )

            saved_responses.append({
                'saved_response_id': search_response.saved_response_id,
                'task': search_response.task,
                'created_at': search_response.created_at,
            })

        return Response({'message': 'Search responses saved successfully', 'responses': saved_responses}, status=status.HTTP_201_CREATED)


class RetrieveSearchResponseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, estimate_id):
        user = request.user
        search_responses = SearchResponseData.objects.filter(user=user, estimate_reference_id=estimate_id)

        tasks = [
            {"saved_response_id": response.saved_response_id, "task": response.task}
            for response in search_responses
        ]
        
        return Response({"tasks": tasks}, status=status.HTTP_200_OK)

    
class DeleteSearchResponseView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, estimate_id, saved_response_id):
        try:
            # print(f"Delete request: estimate_id={estimate_id}, saved_response_id={saved_response_id}")
            user = request.user
            response = SearchResponseData.objects.filter(
                estimate_reference_id=estimate_id,
                saved_response_id=saved_response_id,
                user=user,
            ).first()

            if not response:
                # print(f"No matching record found for estimate_id={estimate_id}, saved_response_id={saved_response_id}, user={user}")
                return Response(
                    {"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND
                )

            response.delete()
            # print(f"Task deleted: estimate_id={estimate_id}, saved_response_id={saved_response_id}")
            return Response({"message": "Task removed"}, status=status.HTTP_200_OK)
        except Exception as e:
            # print(f"Error in DeleteSearchResponseView: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_or_update_estimate_margin(request, estimate_id):
    try:
        data = request.data
        user = request.user
        # estimate_id = data.get('estimate_id')
        margin_percent = data.get('margin_percent') or 0
        tax_percent = data.get('tax_percent') or 0
        discount_percent = data.get('discount_percent') or 0

        margin_percent = int(margin_percent) if margin_percent else 0
        tax_percent = int(tax_percent) if tax_percent else 0
        discount_percent = int(discount_percent) if discount_percent else 0

        estimate = UserEstimates.objects.filter(estimate_id=estimate_id, user=user).first()
        if not estimate:
            return Response({'error': 'Estimate not found.'}, status=404)

        estimate_margin, created = EstimateMarginData.objects.get_or_create(
            user=user,
            estimate=estimate,
            defaults={
                'margin_percent': margin_percent,
                'tax_percent': tax_percent,
                'discount_percent': discount_percent,
            }
        )

        if not created:
            estimate_margin.margin_percent = margin_percent
            estimate_margin.tax_percent = tax_percent
            estimate_margin.discount_percent = discount_percent
            estimate_margin.save()

        return Response({
            'message': 'Record saved successfully.',
            'estimate_margin_id': estimate_margin.id,
        }, status=200)

    except ValueError as e:
        return Response({'error': f'Invalid value: {e}'}, status=400)
    except Exception as e:
        return Response({'error': f'Unexpected error: {e}'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_estimate_margin(request, estimate_id):
    try:
        estimate = UserEstimates.objects.filter(estimate_id=estimate_id, user=request.user).first()
        if not estimate:
            # print("No matching estimate found")
            return Response({'error': 'Estimate not found.'}, status=404)

        estimate_margin = EstimateMarginData.objects.filter(estimate=estimate, user=request.user).first()

        if estimate_margin:
            data = {
                'margin_percent': estimate_margin.margin_percent or 0,
                'tax_percent': estimate_margin.tax_percent or 0,
                'discount_percent': estimate_margin.discount_percent or 0,
            }
        else:
            data = {
                'margin_percent': 0,
                'tax_percent': 0,
                'discount_percent': 0,
            }

        return Response(data, status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=400)
