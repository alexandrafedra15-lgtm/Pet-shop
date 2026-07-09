import os
from django.core.management.base import BaseCommand
from django.conf import settings
from catalogo.models import Categoria, Producto

class Command(BaseCommand):
    help = 'Seeds initial categories and products with placeholder images'

    def handle(self, *args, **options):
        # Create media directories
        media_dir = os.path.join(settings.MEDIA_ROOT, 'productos')
        os.makedirs(media_dir, exist_ok=True)

        # Write a 1x1 dummy PNG file
        dummy_png_path = os.path.join(media_dir, 'dummy.png')
        dummy_png_bytes = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
            b'\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xfc\xff\xff'
            b'\x3f\x03\x00\x03\x00\x01\x02\n\xad\x8c\x82\x00\x00\x00\x00IEND\xaeB`\x82'
        )
        with open(dummy_png_path, 'wb') as f:
            f.write(dummy_png_bytes)

        self.stdout.write(self.style.SUCCESS("Placeholder image created at media/productos/dummy.png"))

        # Seed categories
        categories_data = [
            {"nombre": "Alimentos", "descripcion": "Comida nutritiva y croquetas para mascotas"},
            {"nombre": "Juguetes", "descripcion": "Diversión y entretenimiento para tus mascotas"},
            {"nombre": "Accesorios", "descripcion": "Collares, correas, platos y transportadores"},
            {"nombre": "Salud e Higiene", "descripcion": "Champús, antiparasitarios y arenas sanitarias"},
        ]

        categories = {}
        for cat_data in categories_data:
            cat, created = Categoria.objects.get_or_create(
                nombre=cat_data["nombre"],
                defaults={"descripcion": cat_data["descripcion"]}
            )
            categories[cat.nombre] = cat
            if created:
                self.stdout.write(f"Categoría '{cat.nombre}' creada.")

        # Seed products
        products_data = [
            # Alimentos
            {
                "categoria": "Alimentos",
                "nombre": "Croquetas Premium para Perro",
                "descripcion": "Croquetas balanceadas ricas en proteínas para perros adultos de raza mediana.",
                "precio": "45.90",
                "stock": 50,
                "especie_compatible": "perro",
            },
            {
                "categoria": "Alimentos",
                "nombre": "Alimento Húmedo de Salmón para Gato",
                "descripcion": "Lata de sabroso paté de salmón para gatos de todas las edades.",
                "precio": "8.50",
                "stock": 100,
                "especie_compatible": "gato",
            },
            # Juguetes
            {
                "categoria": "Juguetes",
                "nombre": "Juguete de Cuerda Mordedor",
                "descripcion": "Cuerda resistente de algodón ideal para limpiar los dientes de tu perro jugando.",
                "precio": "15.50",
                "stock": 30,
                "especie_compatible": "perro",
            },
            {
                "categoria": "Juguetes",
                "nombre": "Ratón de Peluche con Catnip",
                "descripcion": "Ratón de juguete relleno de catnip orgánico para volver loco de felicidad a tu gato.",
                "precio": "12.00",
                "stock": 40,
                "especie_compatible": "gato",
            },
            {
                "categoria": "Juguetes",
                "nombre": "Rascador de Cartón para Gato",
                "descripcion": "Rascador de cartón corrugado para limar uñas y evitar arañazos en muebles.",
                "precio": "35.00",
                "stock": 12,
                "especie_compatible": "gato",
            },
            # Accesorios
            {
                "categoria": "Accesorios",
                "nombre": "Collar Ajustable Verde Bosque",
                "descripcion": "Collar ajustable de nailon de alta resistencia con broche de seguridad de liberación rápida.",
                "precio": "22.00",
                "stock": 15,
                "especie_compatible": "perro",
            },
            {
                "categoria": "Accesorios",
                "nombre": "Plato de Acero Inoxidable Doble",
                "descripcion": "Platos dobles con base antideslizante de silicona para comida y agua.",
                "precio": "28.50",
                "stock": 20,
                "especie_compatible": "ambos",
            },
            {
                "categoria": "Accesorios",
                "nombre": "Transportador Confort Viaje",
                "descripcion": "Bolso transportador plegable, ventilado y cómodo para perros pequeños o gatos.",
                "precio": "85.00",
                "stock": 8,
                "especie_compatible": "ambos",
            },
            # Salud e Higiene
            {
                "categoria": "Salud e Higiene",
                "nombre": "Champú Antiparasitario de Avena",
                "descripcion": "Champú antiparasitario e hipoalergénico que repele pulgas, garrapatas y nutre la piel.",
                "precio": "18.90",
                "stock": 20,
                "especie_compatible": "perro",
            },
            {
                "categoria": "Salud e Higiene",
                "nombre": "Arena Sanitaria de Bentonita 5kg",
                "descripcion": "Arena aglomerante de bentonita con aroma a lavanda para control total de olores.",
                "precio": "25.00",
                "stock": 25,
                "especie_compatible": "gato",
            },
            {
                "categoria": "Salud e Higiene",
                "nombre": "Toallitas Húmedas Hipoalergénicas",
                "descripcion": "Pack de 100 toallitas húmedas limpiadoras sin alcohol para ojos, orejas y patitas.",
                "precio": "14.50",
                "stock": 60,
                "especie_compatible": "ambos",
            },
        ]

        for prod_data in products_data:
            cat_obj = categories[prod_data["categoria"]]
            prod, created = Producto.objects.get_or_create(
                nombre=prod_data["nombre"],
                defaults={
                    "categoria": cat_obj,
                    "descripcion": prod_data["descripcion"],
                    "precio": prod_data["precio"],
                    "stock": prod_data["stock"],
                    "especie_compatible": prod_data["especie_compatible"],
                    "imagen": "productos/dummy.png"
                }
            )
            if created:
                self.stdout.write(f"Producto '{prod.nombre}' creado.")

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
