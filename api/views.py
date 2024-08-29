import json, requests, logging, os, stripe
from stripe import CardError, RateLimitError, InvalidRequestError, AuthenticationError, APIConnectionError, StripeError
from rest_framework.views import APIView
from .models import LangchainPgEmbedding
from util.embedding import get_embedding
from pgvector.django import L2Distance, CosineDistance
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from util.serializers import LangchainPgEmbeddingSerializer, MyResponseSerializer, UserSerializer, NoteDictSerializer
from util.multi_query_retriever import generate_response
from util.ai_response import get_response
from util.image_encoder import encode_image
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from util.text_converter import image_to_text
from rest_framework.permissions import AllowAny
from dotenv import load_dotenv
import posixpath
from pathlib import Path
from .models import Subscription, UserToken
from django.utils._os import safe_join
from django.views.static import serve as static_serve
from datetime import timedelta
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

load_dotenv()
logger = logging.getLogger(__name__)

REDIR_URI = os.getenv('REDIR_URI')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_SECRET_KEY = os.getenv('GOOGLE_SECRET_KEY')

GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_SECRET_KEY = os.getenv('GITHUB_SECRET_KEY')

TOKEN_ALLOCATION_MAP = os.getenv('TOKEN_ALLOCATION_MAP')

stripe.api_key=os.getenv('STRIPE_SECRET_KEY')

def serve_react(request, path, document_root=None):
    path = posixpath.normpath(path).lstrip("/")
    fullpath = Path(safe_join(document_root, path))
    if fullpath.is_file():
        return static_serve(request, path, document_root)
    else:
        return static_serve(request, "index.html", document_root)
    

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
                print("invalid: ", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'No photo provided'}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        return Response({'message': 'Send a POST request with a Photo'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    else:
        return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)\

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UsernameTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        username = request.data.get('username')

        try:
            user = User.objects.get(username=username)
            # Check for active subscription
            active_subscription = Subscription.objects.filter(user=user, is_active=True).exists()

            response.data['has_active_subscription'] = active_subscription

            if not active_subscription:
                response.data['detail'] = "Subscription required."
                response.status_code = status.HTTP_403_FORBIDDEN  # Use 403 to indicate forbidden access
        except User.DoesNotExist:
            response.data['detail'] = "Invalid credentials."
            response.status_code = status.HTTP_401_UNAUTHORIZED  # Use 401 for unauthorized access

        return response


class GoogleTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        user = self.get_user(request.data['username'])

        # Custom logic to check if the user has an active subscription
        active_subscription = Subscription.objects.filter(user=user, is_active=True).exists()

        response.data['has_active_subscription'] = active_subscription
        return response


class GoogleLoginView(APIView):
    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Authorization code is missing'}, status=status.HTTP_400_BAD_REQUEST)
        token_response = requests.post(
            'https://oauth2.googleapis.com/token',
            data={
                'code': code,
                'client_id': GOOGLE_CLIENT_ID,
                'client_secret': GOOGLE_SECRET_KEY,
                'redirect_uri': f'{REDIR_URI}/google-callback',
                'grant_type': 'authorization_code'
            }
        )

        token_data = token_response.json()

        if 'error' in token_data:
            return Response({'error': token_data['error']}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_data.get('access_token')
        id_token = token_data.get('id_token')

        if not access_token or not id_token:
            return Response({'error': 'Invalid token response'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch user info using the access token
        user_info_response = requests.get(
            'https://www.googleapis.com/oauth2/v1/userinfo',
            params={'access_token': access_token}
        )

        if user_info_response.status_code != 200:
            return Response({'error': 'Failed to fetch user info'}, status=status.HTTP_400_BAD_REQUEST)

        user_info = user_info_response.json()
        email = user_info.get('email')

        # Fetch or create user
        user, created = User.objects.get_or_create(username=email, defaults={'email': email})

        # Check subscription status
        has_active_subscription = Subscription.objects.filter(user=user, is_active=True).exists()

        if not has_active_subscription:
            return Response({'error': 'User does not have an active subscription'}, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'access_token': access_token,
            'id_token': id_token,
        }, status=status.HTTP_200_OK)

class GitHubLoginView(APIView):
    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Authorization code is missing'}, status=status.HTTP_400_BAD_REQUEST)
        token_response = requests.post(
            'https://github.com/login/oauth/access_token',
            data={
                'client_id': GITHUB_CLIENT_ID,
                'client_secret': GITHUB_SECRET_KEY,
                'code': code,
                'redirect_uri': f'{REDIR_URI}/github-callback',
            },
            headers={'Accept': 'application/json'}
        )

        token_data = token_response.json()

        if 'error' in token_data:
            return Response({'error': token_data['error_description']}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_data.get('access_token')

        return Response({
            'access_token': access_token,
        }, status=status.HTTP_200_OK)



stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

class CreateSubscriptionCheckoutSessionView(APIView):
    def post(self, request):
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='subscription',
                line_items=[{
                    'price': 'price_1PstxaAzRgND7jpk1WHzOKKD',
                    'quantity': 1,
                }],
                success_url=f'{REDIR_URI}/success',
                cancel_url=f'{REDIR_URI}/cancel',
            )
            return JsonResponse({'sessionId': session.id})
        except Exception as e:
            return JsonResponse({'error': str(e)})


class CreateTokenCheckoutSessionView(APIView):
    def post(self, request):
        # Use request.data.get() to handle JSON data
        token_amount = request.data.get('token_amount')
        price_id = None  # Use None instead of "None"

        if token_amount == '50':
            price_id = 'price_1PsuAiAzRgND7jpk2YO1xr9d'
        elif token_amount == '75':
            price_id = 'price_1PsuJVAzRgND7jpkAQ3ITu0o'
        elif token_amount == '100':
            price_id = 'price_1PsuK7AzRgND7jpkPIPZNjwM'

        if not price_id:
            return Response({'error': 'Invalid token amount'}, status=400)

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='payment',
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                success_url=f'{REDIR_URI}/success',
                cancel_url=f'{REDIR_URI}/cancel',
            )
            return Response({'sessionId': session.id})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv('STRIPE_SECRET_KEY')
        )
    except ValueError as e:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return HttpResponse(status=400)

    # Handle different event types
    if event['type'] == 'invoice.payment_failed':
        handle_payment_failed(event)
    elif event['type'] == 'customer.subscription.deleted':
        handle_subscription_deleted(event)
    elif event['type'] == 'invoice.payment_succeeded':
        handle_checkout_session_completed(event)

    return JsonResponse({'status': 'success'})


def handle_payment_failed(event):
    # Access customer and subscription info from the event
    subscription_id = event['data']['object']['subscription']
    stripe_customer_id = event['data']['object']['customer']

    # Find the subscription in your database
    try:
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription.is_active = False
        subscription.save()
        # Additional logic, like notifying the user, can be added here
    except Subscription.DoesNotExist:
        pass


def handle_subscription_deleted(event):
    # Access customer and subscription info from the event
    subscription_id = event['data']['object']['id']
    stripe_customer_id = event['data']['object']['customer']

    # Find the subscription in your database
    try:
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription.is_active = False
        subscription.cancellation_date = timezone.now()
        subscription.save()
        # Additional logic, like notifying the user, can be added here
    except Subscription.DoesNotExist:
        pass


def handle_checkout_session_completed(event):
    session = event['data']['object']
    customer_id = session.get('customer')
    user = User.objects.get(profile__stripe_customer_id=customer_id)

    try:
        subscription, created = Subscription.objects.get_or_create(user=user)
        subscription.is_active = True

        # Set or update subscription type and token allocation
        subscription_type = session.get('subscription_type', 'Basic')
        subscription.subscription_type = subscription_type

        # Set token allocation based on subscription type
        tokens_to_add = TOKEN_ALLOCATION_MAP.get(subscription_type, 0)
        subscription.token_allocation = tokens_to_add
        subscription.save()

        # Add tokens to the user's balance
        user_token, created = UserToken.objects.get_or_create(user=user)
        user_token.token_balance += tokens_to_add
        user_token.save()

    except Exception as e:
        print(f"Error handling subscription: {e}")
