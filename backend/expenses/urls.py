from django.urls import path
from . import views

urlpatterns = [
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('expenses/', views.expense_list, name='expense-list'),
    path('expenses/<int:pk>/', views.expense_detail, name='expense-detail'),
]