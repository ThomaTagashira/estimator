import json, requests, logging, os, stripe
from rest_framework.views import APIView
from util.embedding import get_embedding
from pgvector.django import L2Distance, CosineDistance
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from util.serializers import *
from util.multi_query_retriever import generate_response
from util.ai_response import get_response
from util.image_encoder import encode_image
from django.http import JsonResponse, HttpResponse
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
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from rest_framework.exceptions import ValidationError

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
@permission_classes([AllowAny])
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
                timeout=10  #timeout for network stability
            )
            token_response.raise_for_status()  #raise an HTTPError for bad responses
            token_data = token_response.json()
        except requests.exceptions.RequestException as e:
            return Response({'error': f'Failed to exchange token: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if 'error' in token_data:
            return Response({'error': token_data['error']}, status=status.HTTP_400_BAD_REQUEST)

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
        except requests.exceptions.RequestException as e:
            return Response({'error': f'Failed to fetch user info: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user_info = user_info_response.json()
        email = user_info.get('email')

        if not email:
            return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user, created = User.objects.get_or_create(username=email, defaults={'email': email})

            if created:
                existing_profile = StripeProfile.objects.filter(user=user).exists()
                if not existing_profile:
                    try:
                        customer = stripe.Customer.create(email=user.email)
                        StripeProfile.objects.create(user=user, stripe_customer_id=customer['id'])
                    except Exception as e:
                        user.delete()
                        return Response({'error': f'Failed to create Stripe customer: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            refresh = RefreshToken.for_user(user)
            jwt_access_token = str(refresh.access_token)
            jwt_refresh_token = str(refresh)
        except Exception as e:
            return Response({'error': f'Failed to generate JWT: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

    if event['type'] == 'customer.subscription.updated':
        handle_invoice_payment_succeeded(event['data']['object'])


    elif event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        if session.get('mode') == 'subscription':
            handle_checkout_session_completed(session)
        elif session.get('mode') == 'payment' and session.get('metadata', {}).get('type') == 'token_purchase':
            handle_token_purchase(session)

    elif event['type'] == 'invoice.payment_succeeded':
        handle_invoice_payment_succeeded(event['data']['object'])

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
        # add notify user payment failed email logic (Email)
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
        # Add notify user subscription canceled logic here (Email)
    except Subscription.DoesNotExist:
        pass






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

    if not customer_id or not subscription_id:
        logger.error("Customer ID or Subscription ID is missing, skipping processing.")
        return

    try:
        user = User.objects.get(profile__stripe_customer_id=customer_id)
        logger.info(f"Processing user: {user.username}")

        subscription, created = Subscription.objects.get_or_create(user=user)

        if subscription.stripe_subscription_id != subscription_id:
            logger.info(f"Updating subscription ID for user: {user.username}")
            subscription.stripe_subscription_id = subscription_id

        subscription.is_active = True
        subscription.save()

        logger.info(f"Subscription reactivated for user: {user.username}")

        line_items = invoice.get('lines', {}).get('data', [])
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
            subscription.last_payment_date = now()
            subscription.cancellation_pending=False
            subscription.save()

            user_token, _ = UserToken.objects.get_or_create(user=user)
            user_token.token_balance += tokens_to_add
            user_token.save()

            logger.info(f"Renewal processed for user: {user.username}, tokens added: {tokens_to_add}")

    except User.DoesNotExist:
        logger.error(f"No user found for customer ID: {customer_id}")
    except Exception as e:
        logger.error(f"Error processing invoice.payment_succeeded: {e}")






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

        client_data = data.get('client', {})
        ClientData.objects.create(
            user=user,
            estimate=estimate,
            client_name=client_data.get('clientName'),
            client_address=client_data.get('clientAddress'),
            client_phone=client_data.get('clientPhone'),
            client_email=client_data.get('clientEmail'),
        )

        project_data = data.get('project', {})
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
        return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_estimates(request):
    user = request.user
    estimates = UserEstimates.objects.filter(user=user)
    serializer = UserEstimatesSerializer(estimates, many=True)
    return Response(serializer.data)



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
        print("Error:", e)
        return Response({'error': str(e)}, status=500)




from django.db.models import Max

class SaveEstimateItems(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # print("Request received with data:", request.data)  
        estimate_id = request.data.get('estimate_id')
        # print('estimate_id:', estimate_id)
        tasks = request.data.get('tasks')
        user = request.user

        try:
            estimate = UserEstimates.objects.get(estimate_id=estimate_id, user=user)
        except UserEstimates.DoesNotExist:
            return Response({'error': 'Estimate not found'}, status=status.HTTP_404_NOT_FOUND)

        current_max_task_number = EstimateItems.objects.filter(estimate=estimate).aggregate(
            max_task_number=Max('task_number')
        )['max_task_number'] or 0

        for task in tasks:
            current_max_task_number += 1
            task_description = f"{task['job']} Labor Cost: ${task['laborCost']} Material Cost: ${task['materialCost']}"

            EstimateItems.objects.create(
                user=user,
                estimate=estimate,
                task_number=current_max_task_number,
                task_description=task_description
            )

        return Response({'message': 'Tasks saved successfully'}, status=status.HTTP_201_CREATED)




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



import logging

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
    

from django.utils.timezone import now
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    """
    Allows a user to cancel their subscription.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=403)

    try:
        subscription = Subscription.objects.get(user=request.user, is_active=True)

        # Calculate the end date (e.g., 30 days from today for monthly plans)
        subscription.cancellation_date = now()
        subscription.cancellation_pending = True
        subscription.end_date = subscription.last_payment_date + timedelta(days=30)
        subscription.save()

        return JsonResponse({
            'message': 'Subscription cancellation requested successfully.',
            'cancellation_date': subscription.cancellation_date,
            'end_date': subscription.end_date,
        })

    except Subscription.DoesNotExist:
        return JsonResponse({'error': 'No active subscription found.'}, status=404)

    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)
    

