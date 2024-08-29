from django.db import models
from pgvector.django import VectorField
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User

@receiver(post_save, sender=User)
def manage_user_profile(sender, instance, created, **kwargs):
    if created:
        try:
            StripeProfile.objects.create(user=instance)
        except Exception as e:
            print(f"Error creating StripeProfile for {instance.username}: {e}")
    else:
        instance.profile.save()

class StripeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    stripe_customer_id = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class UserToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='token')
    token_balance = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}: {self.token_balance} tokens"

class Subscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=False)
    subscription_type = models.CharField(
        max_length=50,
        choices=[('Basic', 'Basic'), ('Premium', 'Premium'), ('Enterprise', 'Enterprise')]
    )
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    renewal_date = models.DateTimeField(null=True, blank=True)
    payment_method = models.CharField(
        max_length=50,
        choices=[('Credit Card', 'Credit Card'), ('PayPal', 'PayPal'), ('Stripe', 'Stripe')]
    )
    stripe_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancellation_date = models.DateTimeField(null=True, blank=True)
    auto_renew = models.BooleanField(default=True)
    trial_end_date = models.DateTimeField(null=True, blank=True)
    token_allocation = models.PositiveIntegerField(default=0)
    last_token_allocation_date = models.DateTimeField(null=True, blank=True)  # New field

    def __str__(self):
        return f"{self.user.username}'s subscription: {self.subscription_type} - {'Active' if self.is_active else 'Inactive'}"


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