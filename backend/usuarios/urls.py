from django.urls import path
from .views import UsuarioRegistroView, CustomTokenObtainPairView

urlpatterns = [
    path('auth/register/', UsuarioRegistroView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
]
