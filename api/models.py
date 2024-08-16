from django.db import models
from pgvector.django import VectorField

class LangchainPgCollection(models.Model):
    name = models.CharField(blank=True, null=True)
    cmetadata = models.TextField(blank=True, null=True)
    uuid = models.UUIDField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'langchain_pg_collection'


class LangchainPgEmbedding(models.Model):
    collection = models.ForeignKey(LangchainPgCollection, models.DO_NOTHING, blank=True, null=True)
    embedding = VectorField(dimensions=1536)
    document = models.CharField(blank=True, null=True)
    cmetadata = models.TextField(blank=True, null=True)
    custom_id = models.CharField(blank=True, null=True)
    uuid = models.UUIDField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'langchain_pg_embedding'


class HandymanPgCollection(models.Model):
    name = models.CharField(blank=True, null=True)
    cmetadata = models.TextField(blank=True, null=True)
    uuid = models.UUIDField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'handyman_pg_collection'


class HandymanPgEmbeddings(models.Model):
    collection = models.ForeignKey(LangchainPgCollection, models.DO_NOTHING, blank=True, null=True)
    embedding = VectorField(dimensions=1536)
    document = models.CharField(blank=True, null=True)
    cmetadata = models.TextField(blank=True, null=True)
    custom_id = models.CharField(blank=True, null=True)
    uuid = models.UUIDField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'handyman_pg_embedding'