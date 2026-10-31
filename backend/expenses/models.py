from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Expense(models.Model):
    # Link the expense to a specific user
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50)
    date = models.DateField()
    note = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} ({self.category})"