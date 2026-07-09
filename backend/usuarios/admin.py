from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

class UsuarioAdmin(UserAdmin):
    model = Usuario
    list_display = ('email', 'telefono', 'fecha_registro', 'is_staff', 'is_active')
    # Custom fieldsets to include the telefono field
    fieldsets = UserAdmin.fieldsets + (
        ('Información de Contacto', {'fields': ('telefono',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información de Contacto', {'fields': ('telefono',)}),
    )
    ordering = ('email',)

admin.site.register(Usuario, UsuarioAdmin)
