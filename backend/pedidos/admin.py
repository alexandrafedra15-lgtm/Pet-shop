from django.contrib import admin
from .models import Pedido, DetallePedido

class DetallePedidoInline(admin.TabularInline):
    model = DetallePedido
    extra = 0
    readonly_fields = ('subtotal',)


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'fecha', 'estado', 'total')
    list_filter = ('estado', 'fecha')
    search_fields = ('id', 'usuario__email')
    inlines = [DetallePedidoInline]
    readonly_fields = ('total',)


@admin.register(DetallePedido)
class DetallePedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'pedido', 'producto', 'cantidad', 'subtotal')
    readonly_fields = ('subtotal',)
