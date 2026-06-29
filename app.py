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
            /* Nuevo fondo oscuro y frío */
            background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            color: #ffffff;
        }
        /* Efecto Glassmorphism (Cristal) */
        .card-custom {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.4);
            padding: 3rem;
            text-align: center;
            max-width: 480px;
            width: 90%;
        }
        .btn-custom {
            background-color: #00d2ff;
            color: #0f2027;
            border: none;
            padding: 12px 30px;
            border-radius: 50px;
            font-weight: bold;
            transition: all 0.3s ease;
            width: 100%;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .btn-custom:hover {
            background-color: #3a7bd5;
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 210, 255, 0.4);
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            text-shadow: 0 0 20px rgba(255,255,255,0.2);
        }
        /* Inputs personalizados para que combinen con el fondo oscuro */
        .form-control-custom {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            border-radius: 10px;
        }
        .form-control-custom::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }
        .form-control-custom:focus {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            box-shadow: 0 0 10px rgba(0, 210, 255, 0.3);
            border-color: #00d2ff;
        }
        .result-box {
            background-color: rgba(0, 210, 255, 0.1);
            border-left: 5px solid #00d2ff;
            border-radius: 10px;
            padding: 15px;
            backdrop-filter: blur(5px);
        }
        .text-muted-custom {
            color: rgba(255, 255, 255, 0.7) !important;
        }
    </style>
</head>
<body>

    <div class="card-custom">
        <div class="icon">❄️</div>
        <h1 class="mb-3 fw-bold">Conversor Termométrico</h1>
        <p class="text-muted-custom mb-4">
            Ingresa los grados en Celsius (°C) para calcular de forma inmediata su equivalente en Fahrenheit (°F).
        </p>
        
        <form method="POST" action="/">
            <div class="mb-4">
                <input type="number" step="any" name="celsius" class="form-control text-center form-control-lg form-control-custom" placeholder="Ej: 25" required value="{{ celsius_enviado }}">
            </div>
            <button type="submit" class="btn btn-custom mb-4">Convertir ahora ✨</button>
        </form>

        {% if resultado is not none %}
            <div class="result-box mt-2 text-start">
                <span class="fw-bold d-block mb-1" style="color: #00d2ff;">¡Conversión Exitosa!</span>
                <span class="fs-5 text-white">{{ celsius_enviado }}°C equivalen a <strong>{{ resultado }}°F</strong></span>
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
            
            # Pequeña mejora visual (opcional): redondear a 2 decimales si el resultado es muy largo
            if isinstance(resultado, float):
                resultado = round(resultado, 2)
                
        except ValueError:
            resultado = "Valor inválido"
            
    return render_template_string(HTML_TEMPLATE, resultado=resultado, celsius_enviado=celsius_enviado)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)