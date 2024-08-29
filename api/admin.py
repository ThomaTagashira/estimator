from django.contrib import admin
from .models import Subscription

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'subscription_type', 'is_active', 'start_date', 'end_date')
    list_filter = ('is_active', 'subscription_type')
    search_fields = ('user__username', 'stripe_subscription_id')
