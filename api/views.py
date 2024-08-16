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
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from util.text_converter import image_to_text
from rest_framework.permissions import AllowAny
from dotenv import load_dotenv
from django.shortcuts import render
import posixpath
from pathlib import Path
from django.utils._os import safe_join
from django.views.static import serve as static_serve

load_dotenv()
logger = logging.getLogger(__name__)

REDIR_URI = os.getenv('REDIR_URI')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_SECRET_KEY = os.getenv('GOOGLE_SECRET_KEY')

GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_SECRET_KEY = os.getenv('GITHUB_SECRET_KEY')

STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')

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

        # Handling job_scope search
        if job_scope:
            return process_job_scope(job_scope)

        # Handling individual line search
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


stripe.api_key = STRIPE_SECRET_KEY

class PaymentView(APIView):
    def post(self, request):
        token = request.data.get('token')

        try:
            charge = stripe.Charge.create(
                amount=500,  # Amount in cents
                currency='usd',
                source=token,
                description='Example charge',
            )
            return Response({'status': 'Payment successful'}, status=status.HTTP_200_OK)
        except CardError as e:
            # Handle card errors
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except RateLimitError as e:
            # Handle rate limit errors
            return Response({'error': 'Too many requests made to the API too quickly'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        except InvalidRequestError as e:
            # Handle invalid parameters
            return Response({'error': 'Invalid parameters were supplied to Stripe\'s API'}, status=status.HTTP_400_BAD_REQUEST)
        except AuthenticationError as e:
            # Handle authentication errors
            return Response({'error': 'Authentication with Stripe\'s API failed'}, status=status.HTTP_401_UNAUTHORIZED)
        except APIConnectionError as e:
            # Handle network communication errors
            return Response({'error': 'Network communication with Stripe failed'}, status=status.HTTP_502_BAD_GATEWAY)
        except StripeError as e:
            # Handle general Stripe errors
            return Response({'error': 'Something went wrong with Stripe. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            # Handle other errors
            return Response({'error': 'An error occurred. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

def serve_react(request, path, document_root=None):
    path = posixpath.normpath(path).lstrip("/")
    fullpath = Path(safe_join(document_root, path))
    if fullpath.is_file():
        return static_serve(request, path, document_root)
    else:
        return static_serve(request, "index.html", document_root)