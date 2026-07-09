from django.contrib import admin
from .models import Pago

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('id', 'pedido', 'paypal_order_id', 'estado', 'monto', 'fecha')
    list_filter = ('estado', 'fecha')
    search_fields = ('paypal_order_id', 'pedido__id', 'pedido__usuario__email')
