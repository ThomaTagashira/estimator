# api/management/commands/allocate_tokens.py

from django.core.management.base import BaseCommand
from api.tasks import allocate_monthly_tokens

class Command(BaseCommand):
    help = 'Allocates tokens to users based on their subscription'

    def handle(self, *args, **kwargs):
        allocate_monthly_tokens()
        self.stdout.write(self.style.SUCCESS('Successfully allocated tokens to users'))
