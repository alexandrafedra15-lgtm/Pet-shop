from rest_framework import serializers
from django.db import transaction
from catalogo.models import Producto
from .models import Pedido, DetallePedido

class DetallePedidoSerializer(serializers.ModelSerializer):
    producto_id = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(),
        source='producto'
    )
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    producto_precio = serializers.ReadOnlyField(source='producto.precio')

    class Meta:
        model = DetallePedido
        fields = ('id', 'producto_id', 'producto_nombre', 'producto_precio', 'cantidad', 'subtotal')
        read_only_fields = ('subtotal',)


class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True)
    usuario = serializers.ReadOnlyField(source='usuario.email')

    class Meta:
        model = Pedido
        fields = ('id', 'usuario', 'fecha', 'estado', 'total', 'detalles')
        read_only_fields = ('estado', 'total')

    def validate_detalles(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError("El pedido debe contener al menos un producto.")
        return value

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        user = self.context['request'].user

        # Perform atomic transaction for database integrity
        with transaction.atomic():
            # 1. Create base Pedido record
            pedido = Pedido.objects.create(
                usuario=user,
                total=0.00,
                estado='pendiente'
            )
            
            total_pedido = 0
            
            # 2. Iterate and process each product detail
            for detail_data in detalles_data:
                producto = detail_data['producto']
                cantidad = detail_data['cantidad']
                
                # Lock the specific product row to ensure accurate concurrent stock check/deduction
                producto_locked = Producto.objects.select_for_update().get(pk=producto.pk)
                
                # Validate stock availability
                if cantidad > producto_locked.stock:
                    # Throw bad request validation error
                    raise serializers.ValidationError(
                        f"No hay suficiente stock para el producto '{producto_locked.nombre}'. "
                        f"Stock disponible: {producto_locked.stock}, solicitado: {cantidad}."
                    )
                
                # Decrement stock and save
                producto_locked.stock -= cantidad
                producto_locked.save()
                
                # Calculate subtotal using product price at the moment of purchase
                subtotal = cantidad * producto_locked.precio
                total_pedido += subtotal
                
                # Create the DetallePedido entry
                DetallePedido.objects.create(
                    pedido=pedido,
                    producto=producto_locked,
                    cantidad=cantidad,
                    subtotal=subtotal
                )
            
            # 3. Save the final calculated total to the Pedido
            pedido.total = total_pedido
            pedido.save()
            
        return pedido
