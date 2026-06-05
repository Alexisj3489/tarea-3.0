# test_app.py
from app import app

def test_home_page():
    # Creamos un cliente de pruebas para simular visitas al servidor Flask
    with app.test_client() as client:
        response = client.get('/')
        # Verifica que la página web responda con éxito (Código 200)
        assert response.status_code == 200
        # Verifica que el HTML contenga la palabra "Flask" o "Página"
        assert b"Flask" in response.data