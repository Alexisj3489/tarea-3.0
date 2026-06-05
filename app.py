from flask import Flask, render_template_string, request

app = Flask(__name__)

# Lógica pura de Python (Esto es lo que probará pytest para tu nota)
def celsius_a_fahrenheit(celsius: float) -> float:
    return (celsius * 9/5) + 32

# Guardamos el HTML, CSS y la lógica responsiva en el string
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conversor de Unidades - Tarea 3.0</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
        }
        .card-custom {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.3);
            padding: 3rem;
            text-align: center;
            max-width: 480px;
            width: 90%;
        }
        .btn-custom {
            background-color: #ff5e62;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 50px;
            font-weight: bold;
            transition: all 0.3s ease;
            width: 100%;
        }
        .btn-custom:hover {
            background-color: #ff9966;
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(255, 94, 98, 0.4);
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .result-box {
            background-color: #fff3cd;
            border-left: 5px solid #ffc107;
            border-radius: 10px;
            padding: 15px;
        }
    </style>
</head>
<body>

    <div class="card-custom">
        <div class="icon">🌡️</div>
        <h1 class="mb-3">Conversor Termométrico</h1>
        <p class="text-muted mb-4">
            Ingresa los grados en Celsius (°C) para calcular de forma inmediata su equivalente en Fahrenheit (°F).
        </p>
        
        <form method="POST" action="/">
            <div class="mb-4">
                <input type="number" step="any" name="celsius" class="form-control text-center form-control-lg" placeholder="Ej: 25" required value="{{ celsius_enviado }}">
            </div>
            <button type="submit" class="btn btn-custom mb-4">Convertir ahora 🚀</button>
        </form>

        {% if resultado is not none %}
            <div class="result-box mt-2 text-start">
                <span class="fw-bold text-warning-depth d-block mb-1">¡Conversión Exitosa!</span>
                <span class="fs-5 text-dark">{{ celsius_enviado }}°C equivalen a <strong>{{ resultado }}°F</strong></span>
            </div>
        {% endif %}
    </div>

</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def home():
    resultado = None
    celsius_enviado = ""
    
    if request.method == 'POST':
        try:
            celsius_enviado = request.form.get('celsius', '')
            # Conversión usando nuestra función matemática
            resultado = celsius_a_fahrenheit(float(celsius_enviado))
        except ValueError:
            resultado = "Valor inválido"
            
    return render_template_string(HTML_TEMPLATE, resultado=resultado, celsius_enviado=celsius_enviado)

# Corrección crítica: '__main__' con 'i' para que corra en entornos locales y Docker
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)