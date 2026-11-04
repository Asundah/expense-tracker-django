from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Expense

# 1. User Serializer (for registration)
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value
    
    def create(self, validated_data):
        # Securely hash the password before saving the user
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

# 2. Expense Serializer (for CRUD operations)
class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'amount', 'category', 'date', 'note']