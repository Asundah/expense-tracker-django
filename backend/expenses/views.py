from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import Expense
from .serializers import UserSerializer, ExpenseSerializer

# Create your views here.

#  AUTHENTICATION

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Create a token for the new user immediately
        token, created = Token.objects.get_or_create(user=user)
        return Response ({"token": token.key, "username": user.username}, status=status.HTTP_201_CREATED)
    return Response (serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username}, status=status.HTTP_200_OK)
    return Response ({"error": "Invalid Credentials"}, status=status.HTTP_400_BAD_REQUEST)

# EXPENSES

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def expense_list(request):
    if request.method == 'GET':
        # Only get expenses for the logged in user
        expenses = Expense.objects.filter(user=request.user).order_by('-date')
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically attach the logged in user to the expense
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def expense_detail(request, pk):
    try:
        # Find the expense, but ONLY if it belongs to the logged in user
        expense = Expense.objects.get(pk=pk, user=request.user)
    except Expense.DoesNotExist:
        return Response({"error": "Expense not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)