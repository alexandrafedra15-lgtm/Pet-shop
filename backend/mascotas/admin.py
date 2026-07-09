from django.contrib import admin
from .models import Mascota

@admin.register(Mascota)
class MascotaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'usuario', 'especie', 'raza', 'edad')
    list_filter = ('especie',)
    search_fields = ('nombre', 'usuario__email', 'raza')
