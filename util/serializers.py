from django.contrib.auth.models import Group, User
from rest_framework import serializers
from api.models import *
import json
import logging

class LangchainPgCollectionSearializer(serializers.ModelSerializer):
    class Meta:
        model = LangchainPgCollection
        fields = '__all__'

class LangchainPgEmbeddingSerializer(serializers.ModelSerializer):
    class Meta:
        model = LangchainPgEmbedding
        fields = '__all__'


logger = logging.getLogger(__name__)

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
    strings = serializers.ListField(child=serializers.CharField(max_length=100000))

class NoteSerializer(serializers.Serializer):
    key = serializers.CharField(max_length=50)
    value = serializers.CharField(max_length=200)

class NoteDictSerializer(serializers.Serializer):
    strings = serializers.DictField(
        child=serializers.CharField(max_length=200)
    )

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user