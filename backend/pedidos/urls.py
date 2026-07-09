from django.urls import path
from .views import PedidoCreateView, PedidoDetailView

urlpatterns = [
    path('pedidos/', PedidoCreateView.as_view(), name='pedido-create'),
    path('pedidos/<int:id>/', PedidoDetailView.as_view(), name='pedido-detail'),
]
