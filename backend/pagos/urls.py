from django.urls import path
from .views import CrearOrdenPaypalView, CapturarOrdenPaypalView

urlpatterns = [
    path('pago/crear-orden/<int:pedido_id>/', CrearOrdenPaypalView.as_view(), name='pago-crear-orden'),
    path('pago/capturar/<str:order_id>/', CapturarOrdenPaypalView.as_view(), name='pago-capturar'),
]
