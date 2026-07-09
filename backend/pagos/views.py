import base64
import requests
from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from pedidos.models import Pedido
from catalogo.models import Producto
from .models import Pago
from .serializers import PagoSerializer

def get_paypal_api_base():
    mode = getattr(settings, 'PAYPAL_MODE', 'sandbox').lower().strip()
    if mode == 'live':
        return "https://api-m.paypal.com"
    return "https://api-m.sandbox.paypal.com"


def get_paypal_access_token():
    client_id = getattr(settings, 'PAYPAL_CLIENT_ID', '')
    secret = getattr(settings, 'PAYPAL_SECRET', '')
    
    if not client_id or not secret:
        raise ValueError("Credenciales de PayPal (PAYPAL_CLIENT_ID, PAYPAL_SECRET) no configuradas.")

    base_url = get_paypal_api_base()
    url = f"{base_url}/v1/oauth2/token"
    
    # Base64 encode credentials
    auth_str = f"{client_id}:{secret}"
    auth_bytes = auth_str.encode('utf-8')
    auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
    
    headers = {
        "Authorization": f"Basic {auth_b64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    data = {"grant_type": "client_credentials"}
    
    response = requests.post(url, headers=headers, data=data, timeout=15)
    response.raise_for_status()
    return response.json().get("access_token")


class CrearOrdenPaypalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pedido_id):
        # 1. Fetch pedido and ensure ownership
        try:
            pedido = Pedido.objects.get(pk=pedido_id, usuario=request.user)
        except Pedido.DoesNotExist:
            return Response(
                {"error": "Pedido no encontrado o no pertenece a su usuario."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Check if already paid
        if pedido.estado == 'pagado':
            return Response(
                {"error": "Este pedido ya ha sido pagado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Request Access Token from PayPal
        try:
            access_token = get_paypal_access_token()
        except Exception as e:
            return Response(
                {"error": f"Error al autenticar con PayPal: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 4. Call PayPal Orders API to create the transaction
        base_url = get_paypal_api_base()
        url = f"{base_url}/v2/checkout/orders"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # PayPal expects a string representation of the total amount
        body = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": str(pedido.id),
                    "amount": {
                        "currency_code": "USD",  # USD is standard and safe for all sandbox accounts
                        "value": str(pedido.total)
                    },
                    "description": f"Compra de productos Petshop - Pedido #{pedido.id}"
                }
            ]
        }

        try:
            response = requests.post(url, headers=headers, json=body, timeout=15)
            if response.status_code not in [200, 201]:
                return Response(
                    {"error": "Error al crear la orden en PayPal.", "details": response.json()},
                    status=response.status_code
                )
            
            paypal_data = response.json()
            order_id = paypal_data.get("id")

            # 5. Create or update Pago entry in database
            with transaction.atomic():
                # Delete any previous failed or stale pagos for this pedido
                Pago.objects.filter(pedido=pedido).delete()
                
                pago = Pago.objects.create(
                    pedido=pedido,
                    paypal_order_id=order_id,
                    estado='creado',
                    monto=pedido.total
                )

            return Response({
                "paypal_order_id": order_id,
                "pago_id": pago.id,
                "status": pago.estado,
                "links": paypal_data.get("links")
            }, status=status.HTTP_201_CREATED)

        except requests.RequestException as e:
            return Response(
                {"error": f"Error de comunicación con PayPal: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class CapturarOrdenPaypalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        # 1. Fetch Pago by paypal_order_id
        try:
            pago = Pago.objects.select_related('pedido').get(paypal_order_id=order_id)
        except Pago.DoesNotExist:
            return Response(
                {"error": "El registro de pago no existe en nuestro sistema."},
                status=status.HTTP_404_NOT_FOUND
            )

        pedido = pago.pedido
        
        # Ensure owner is correct
        if pedido.usuario != request.user:
            return Response(
                {"error": "Acceso denegado. Este pedido pertenece a otro usuario."},
                status=status.HTTP_403_FORBIDDEN
            )

        if pago.estado == 'capturado':
            return Response(
                {"message": "El pago ya fue procesado y capturado exitosamente.", "estado": pago.estado},
                status=status.HTTP_200_OK
            )

        # 2. Get Access Token
        try:
            access_token = get_paypal_access_token()
        except Exception as e:
            return Response(
                {"error": f"Error al autenticar con PayPal: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 3. Request Capture to PayPal
        base_url = get_paypal_api_base()
        url = f"{base_url}/v2/checkout/orders/{order_id}/capture"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(url, headers=headers, json={}, timeout=15)
            paypal_data = response.json()
            
            # 4. Check if capture succeeded
            if response.status_code in [200, 201] and paypal_data.get("status") == "COMPLETED":
                # Success transition: Pedido -> pagado, Pago -> capturado
                with transaction.atomic():
                    pago.estado = 'capturado'
                    pago.save()
                    
                    pedido.estado = 'pagado'
                    pedido.save()
                
                return Response({
                    "message": "Pago procesado y completado con éxito.",
                    "pago_estado": pago.estado,
                    "pedido_estado": pedido.estado
                }, status=status.HTTP_200_OK)
                
            else:
                # Failure transition: rollback stock, set Pago -> fallido, Pedido -> pendiente
                with transaction.atomic():
                    pago.estado = 'fallido'
                    pago.save()
                    
                    pedido.estado = 'pendiente'
                    pedido.save()
                    
                    # Release reserved stock (stock rollback)
                    for detail in pedido.detalles.all():
                        producto_locked = Producto.objects.select_for_update().get(pk=detail.producto.pk)
                        producto_locked.stock += detail.cantidad
                        producto_locked.save()
                
                return Response({
                    "error": "El pago no pudo ser capturado.",
                    "details": paypal_data,
                    "pago_estado": pago.estado,
                    "pedido_estado": pedido.estado
                }, status=status.HTTP_400_BAD_REQUEST)

        except requests.RequestException as e:
            # Connection error: treat as pending capture, but do not rollback unless explicitly rejected by PayPal
            return Response(
                {"error": f"Error de red al intentar capturar pago con PayPal: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
