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
from rest_framework.permissions import AllowAny, IsAuthenticated
from dotenv import load_dotenv
import posixpath
from pathlib import Path
from .models import Subscription, UserToken, StripeProfile
from django.utils._os import safe_join
from django.views.static import serve as static_serve
from datetime import timedelta
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

load_dotenv()
logger = logging.getLogger('django')

REDIR_URI = os.getenv('REDIR_URI')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_SECRET_KEY = os.getenv('GOOGLE_SECRET_KEY')

GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_SECRET_KEY = os.getenv('GITHUB_SECRET_KEY')

STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')

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


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def subscription_status(request):
    user = request.user
    try:
        subscription = Subscription.objects.get(user=user)
        response_data = {'has_active_subscription': subscription.is_active}
        logger.debug('Subscription True: %s', response_data)
        return Response(response_data)
    except Subscription.DoesNotExist:
        response_data = {'has_active_subscription': False}
        logger.debug('Subscription False: %s', response_data)
        return Response(response_data)



class UsernameTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        username = request.data.get('username')

        try:
            user = User.objects.get(username=username)
            active_subscription = Subscription.objects.filter(user=user, is_active=True).exists()

            response.data['has_active_subscription'] = active_subscription

            if not active_subscription:
                response.data['detail'] = "Subscription required."
                response.status_code = status.HTTP_403_FORBIDDEN
        except User.DoesNotExist:
            response.data['detail'] = "Invalid credentials."
            response.status_code = status.HTTP_401_UNAUTHORIZED

        return response


class GoogleTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        user = self.get_user(request.data['username'])
        active_subscription = Subscription.objects.filter(user=user, is_active=True).exists()
        response.data['has_active_subscription'] = active_subscription
        return response


from django.db import transaction

class GoogleLoginView(APIView):
    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Authorization code is missing'}, status=status.HTTP_400_BAD_REQUEST)

        # Exchange authorization code for access and ID tokens
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

        # Get user info using the access token
        user_info_response = requests.get(
            'https://www.googleapis.com/oauth2/v1/userinfo',
            params={'access_token': access_token}
        )

        if user_info_response.status_code != 200:
            return Response({'error': 'Failed to fetch user info'}, status=status.HTTP_400_BAD_REQUEST)

        user_info = user_info_response.json()
        email = user_info.get('email')

        with transaction.atomic():
            user, created = User.objects.get_or_create(username=email, defaults={'email': email})

            if created:
                # New user - check if a StripeProfile already exists
                existing_profile = StripeProfile.objects.filter(user=user).exists()
                if not existing_profile:
                    try:
                        # Create a Stripe customer
                        customer = stripe.Customer.create(email=user.email)
                        StripeProfile.objects.create(user=user, stripe_customer_id=customer['id'])
                    except Exception as e:
                        user.delete()  # If there's an issue with Stripe, delete the user to avoid orphaned records
                        return Response({'error': f'Failed to create Stripe customer: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate JWT tokens for the user
        refresh = RefreshToken.for_user(user)
        jwt_access_token = str(refresh.access_token)
        jwt_refresh_token = str(refresh)

        # Check for active subscription
        has_active_subscription = Subscription.objects.filter(user=user, is_active=True).exists()

        return Response({
            'access': jwt_access_token,
            'refresh': jwt_refresh_token,
            'has_active_subscription': has_active_subscription
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
        user = request.user  # Ensure the user is authenticated

        # Retrieve or create StripeProfile
        stripe_profile, created = StripeProfile.objects.get_or_create(user=user)

        if not stripe_profile.stripe_customer_id:
            # Create a Stripe customer if it doesn't exist yet
            try:
                customer = stripe.Customer.create(email=user.email)
                stripe_profile.stripe_customer_id = customer['id']
                stripe_profile.save()
            except Exception as e:
                logger.error(f"Failed to create Stripe customer: {str(e)}")
                return Response({'error': f'Failed to create Stripe customer: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the subscription tier from the request data
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


class CreateTokenCheckoutSessionView(APIView):
    def post(self, request):
        token_amount = request.data.get('tokenQty')
        price_id = None

        TOKEN_PRICE_MAP = os.getenv('TOKEN_PRICE_MAP')
        TOKEN_PRICE_MAP = json.loads(TOKEN_PRICE_MAP)

        if token_amount == '50':
            price_id = TOKEN_PRICE_MAP.get(token_amount)
            logger.info(f"50 Token Price ID: {price_id}")

        elif token_amount == '75':
            price_id = TOKEN_PRICE_MAP.get(token_amount)
            logger.info(f"75 Token Price ID: {price_id}")

        elif token_amount == '100':
            price_id = TOKEN_PRICE_MAP.get(token_amount)
            logger.info(f"100 Token Price ID: {price_id}")

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
@api_view(['POST'])
def stripe_webhook(request):
    payload = request.body.decode('utf-8')
    logger.info(f"Raw payload: {payload}")

    try:
        webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        event = stripe.Webhook.construct_event(
            payload, request.META['HTTP_STRIPE_SIGNATURE'], webhook_secret
        )
        logger.info(f"Stripe event constructed successfully: {event}")

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON payload: {e}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        return HttpResponse(status=400)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return HttpResponse(status=400)

    logger.info(f"Event type: {event['type']} with event data: {event['data']}")


    if event['type'] == 'invoice.payment_succeeded':
        handle_checkout_session_completed(event)
    else:
        logger.info(f"Unhandled event type: {event['type']}")

    return JsonResponse({'status': 'success'})



def handle_payment_failed(event):
    subscription_id = event['data']['object']['subscription']
    stripe_customer_id = event['data']['object']['customer']

    try:
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription.is_active = False
        subscription.save()
        # Additional logic, like notifying the user, can be added here
    except Subscription.DoesNotExist:
        pass


def handle_subscription_deleted(event):
    subscription_id = event['data']['object']['id']
    stripe_customer_id = event['data']['object']['customer']

    try:
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription.is_active = False
        subscription.cancellation_date = timezone.now()
        subscription.save()
        # Additional logic, like notifying the user, can be added here
    except Subscription.DoesNotExist:
        pass


def handle_checkout_session_completed(event):
    logger.info("handle_checkout_session_completed called")
    logger.info(f"Full event data: {event}")

    session = event['data']['object']
    logger.info(f"Session Data: {session}")
    customer_id = session.get('customer')
    logger.info(f"Customer ID from session: {customer_id}")

    if not customer_id:
        logger.error("Customer ID is None, skipping processing.")
        return

    try:
        users = User.objects.filter(profile__stripe_customer_id=customer_id)
        logger.info(f"Users found with customer ID {customer_id}: {users.count()}")

        if users.count() == 1:
            user = users.first()
            logger.info(f"Processing user: {user.username}")

            if user.is_staff or user.is_superuser or getattr(user.profile, 'is_exempt', False):
                logger.info(f"Skipping Stripe processing for exempt user: {user.username}")
                return
        else:
            logger.error(f"Expected 1 user, found {users.count()} for customer ID: {customer_id}")
            return

        user.is_active = True
        user.save()
        logger.info(f"User's is_active set to True for login authorization: {user.username}")

        subscription, created = Subscription.objects.get_or_create(user=user)
        subscription.is_active = True
        logger.info(f"Setting subscription.is_active to True for user: {user.username}")

        # Extract the Product ID from the session data
        line_items = session['lines']['data']

        logger.info(f"Line items: {line_items}")

        for item in line_items:
            price = item.get('price', {})
            logger.info(f"Price: {price}")
            product_id = price.get('product')
            logger.info(f"Product ID: {product_id}")

        PRODUCT_TYPE_MAP = os.getenv('PRODUCT_TYPE_MAP')
        PRODUCT_TYPE_MAP = json.loads(PRODUCT_TYPE_MAP)

        logger.info(f"Product Type Map from .env: {PRODUCT_TYPE_MAP}")

        if product_id:
            if product_id in PRODUCT_TYPE_MAP:
                subscription_type = PRODUCT_TYPE_MAP[product_id]
                logger.info(f"Subscription type determined from product map: {subscription_type}")
            else:
                logger.error(f"Unknown Product ID: {product_id}. Unable to determine subscription type.")
                subscription_type = None
        else:
            logger.error("Product ID is None or not found in line items.")
            subscription_type = None

        TOKEN_ALLOCATION_MAP = os.getenv('TOKEN_ALLOCATION_MAP')
        TOKEN_ALLOCATION_MAP = json.loads(TOKEN_ALLOCATION_MAP)

        logger.info(f"Token Allocation Map from .env: {TOKEN_ALLOCATION_MAP}")

        if subscription_type:
            tokens_to_add  = int(TOKEN_ALLOCATION_MAP.get(subscription_type, 0))
            subscription.subscription_type = subscription_type
            subscription.token_allocation = tokens_to_add
            logger.info(f"Tokens to be Added: {tokens_to_add}")
            subscription.save()
            logger.info(f"Subscription saved with is_active = {subscription.is_active} for user: {user.username}")

            user_token, created = UserToken.objects.get_or_create(user=user)
            user_token.token_balance += tokens_to_add
            user_token.save()
            logger.info(f"Token balance updated for user: {user.username}, new balance: {user_token.token_balance}")
        else:
            logger.error(f"Subscription type could not be determined. User: {user.username}")

    except Exception as e:
        logger.error(f"Error handling subscription: {e}")


