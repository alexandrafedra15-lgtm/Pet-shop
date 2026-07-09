from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from catalogo.models import Producto

class Pedido(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
        ('enviado', 'Enviado'),
        ('cancelado', 'Cancelado'),
    ]

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='pedidos'
    )
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='pendiente'
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        editable=False
    )

    def __str__(self):
        return f"Pedido {self.id} - {self.usuario.email} ({self.estado})"


class DetallePedido(models.Model):
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name='detalles'
    )
    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name='detalles_pedido'
    )
    cantidad = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False
    )

    def __str__(self):
        return f"Detalle {self.id} - Pedido {self.pedido.id} - {self.producto.nombre} (x{self.cantidad})"
