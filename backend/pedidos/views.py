from rest_framework import generics, permissions
from .models import Pedido
from .serializers import PedidoSerializer

class PedidoCreateView(generics.CreateAPIView):
    serializer_class = PedidoSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Provide context to the serializer so it can retrieve the request user
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class PedidoDetailView(generics.RetrieveAPIView):
    serializer_class = PedidoSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        # Strict user isolation: "solo si pertenece al usuario autenticado"
        return Pedido.objects.filter(usuario=self.request.user)
