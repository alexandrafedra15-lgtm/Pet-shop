from django.db import models
from pedidos.models import Pedido

class Pago(models.Model):
    ESTADO_CHOICES = [
        ('creado', 'Creado'),
        ('capturado', 'Capturado'),
        ('fallido', 'Fallido'),
    ]

    pedido = models.OneToOneField(
        Pedido,
        on_delete=models.CASCADE,
        related_name='pago'
    )
    paypal_order_id = models.CharField(
        max_length=150,
        unique=True,
        null=True,
        blank=True
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='creado'
    )
    monto = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pago {self.id} - Pedido {self.pedido.id} - {self.estado}"
