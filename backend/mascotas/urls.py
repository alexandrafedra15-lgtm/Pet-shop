from django.urls import path
from .views import MascotaListCreateView, RazasView

urlpatterns = [
    path('mascotas/', MascotaListCreateView.as_view(), name='mascota-list-create'),
    path('razas/<str:especie>/', RazasView.as_view(), name='razas-list'),
]
