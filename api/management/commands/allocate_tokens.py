from django.core.management.base import BaseCommand
from api.tasks import allocate_monthly_tokens

class Command(BaseCommand):
    help = 'Allocates tokens to users based on their subscription'

    def handle(self, *args, **kwargs):
        print("allocate_tokens command called")  # Entry point check
        try:
            allocate_monthly_tokens()
            print("allocate_monthly_tokens() was called")  # Post function call check
        except Exception as e:
            print(f"Error calling allocate_monthly_tokens: {e}")
        self.stdout.write(self.style.SUCCESS('Successfully allocated tokens to users'))
