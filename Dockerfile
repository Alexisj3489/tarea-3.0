# Paso 1: buscar una aplicacion base
FROM python:3.12-alpine

# Paso 2: crear el directorio de trabajo en el contenedor
WORKDIR /app

# Paso 3: copiar el archivo de dependencias
COPY requirements.txt /app

# Paso 4: instalar las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Paso 5: copiar todo el código fuente (incluyendo la app y los tests)
COPY . /app

# Paso 6: exponer el puerto 5000
EXPOSE 5000

# Paso 7: ejecutar la aplicación
CMD ["python", "app.py"]