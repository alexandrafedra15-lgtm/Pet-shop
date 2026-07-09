from django.db import models
from django.conf import settings

class Mascota(models.Model):
    ESPECIE_CHOICES = [
        ('perro', 'Perro'),
        ('gato', 'Gato'),
    ]

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mascotas'
    )
    nombre = models.CharField(max_length=100)
    especie = models.CharField(max_length=10, choices=ESPECIE_CHOICES)
    raza = models.CharField(max_length=100)
    edad = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.nombre} ({self.especie} - {self.raza})"
