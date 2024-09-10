from django.db import models
from pgvector.django import VectorField
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

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



@receiver(post_save, sender=User)
def manage_user_profile(sender, instance, created, **kwargs):
    if created:
        try:
            StripeProfile.objects.create(user=instance)
        except Exception as e:
            print(f"Error creating StripeProfile for {instance.username}: {e}")
    else:
        pass

class StripeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    stripe_customer_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    is_exempt = models.BooleanField(default=False)

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
    last_token_allocation_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s subscription: {self.subscription_type} - {'Active' if self.is_active else 'Inactive'}"


class UserEstimates(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userEstimates')
    estimate_id = models.CharField(max_length=255, unique=True, editable=False)  # Auto-populated and uneditable
    date_created = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    project_name = models.CharField(max_length=255, blank=True, null=True)  # Add project name here

    def save(self, *args, **kwargs):
        # Only generate estimate_id if it's not already set (i.e., on creation)
        if not self.estimate_id:
            last_estimate = UserEstimates.objects.filter(user=self.user).order_by('id').last()
            if last_estimate:
                new_id = int(last_estimate.estimate_id.split('-')[-1]) + 1  # Increment the number part
            else:
                new_id = 1  # Start at 1 if no previous estimates exist for the user
            self.estimate_id = f"EST-{str(new_id).zfill(5)}"  # Format as EST-00001, EST-00002, etc.
        super().save(*args, **kwargs)


class ProjectData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')  # User who owns the project
    estimate = models.ForeignKey(UserEstimates, on_delete=models.CASCADE, related_name='project_data')
    project_name = models.TextField(blank=True, null=True)
    project_location = models.TextField(blank=True, null=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Check if project_name is empty or None
        if not self.project_name:
            # Get all existing project names for this user that start with 'Estimate'
            existing_projects = ProjectData.objects.filter(user=self.user, project_name__startswith='Estimate').values_list('project_name', flat=True)

            # Find the next available project name for this user (Estimate1, Estimate2, etc.)
            project_number = 1
            while f"Estimate{project_number}" in existing_projects:
                project_number += 1

            # Set the new project name
            self.project_name = f"Estimate{project_number}"

        # Save the project and update UserEstimates with the project name
        super().save(*args, **kwargs)
        if self.project_name:
            self.estimate.project_name = self.project_name
            self.estimate.save()



class EstimateItems(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='estimateItems')
    estimate = models.ForeignKey(UserEstimates, on_delete=models.CASCADE, related_name='estimate_items')
    task_description = models.TextField(blank=True, null=True)
    labor_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    material_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)


class ClientData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='clientData')
    estimate = models.ForeignKey(UserEstimates, on_delete=models.CASCADE, related_name='client_data')
    client_name = models.CharField(max_length=255, unique=False, null=True, blank=True)
    client_address = models.CharField(max_length=255, unique=False, null=True, blank=True)
    client_phone = models.CharField(max_length=255, unique=False, null=True, blank=True)
    client_email = models.CharField(max_length=255, unique=False, null=True, blank=True)

