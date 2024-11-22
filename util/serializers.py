from django.contrib.auth.models import Group, User
from rest_framework import serializers
from api.models import *
import json
import logging


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



from dj_rest_auth.registration.serializers import SocialLoginSerializer

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

class EstimateItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstimateItems
        fields = ['task_description', 'task_number']

# Main serializer for UserEstimates
class UserEstimatesSerializer(serializers.ModelSerializer):
    # Add related fields using the nested serializers
    client_data = ClientDataSerializer(many=True, read_only=True)  # 'many=True' because it's related_name='client_data'
    project_data = ProjectDataSerializer(many=True, read_only=True)  # 'many=True' because it's related_name='project_data'
    estimate_items = EstimateItemsSerializer(many=True, read_only=True)  # 'many=True' because it's related_name='estimate_items'

    class Meta:
        model = UserEstimates
        fields = ['estimate_id', 'date_created', 'last_modified', 'project_name', 'client_data', 'project_data', 'estimate_items']


class BusinessInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessInfo
        fields = ['business_name', 'business_address', 'business_phone', 'business_email']