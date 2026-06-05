# TAREA 3.0 - Automatización de CI/CD con GitHub Actions y Docker

## 📝 Descripción del Proyecto
Este proyecto consiste en el desarrollo de una aplicación web interactiva utilizando el micro-framework **Flask** en Python 3.12, aplicando diseño responsivo mediante **Bootstrap 5**. La aplicación implementa un **Conversor Termométrico Inteligente** que transforma grados Celsius (°C) a Fahrenheit (°F), acoplado a un entorno automatizado de pruebas y despliegue continuo (CI/CD).

El objetivo principal es demostrar la integración de pruebas automatizadas con `pytest`, la contenedorización de la aplicación mediante `Docker` (usando una imagen ligera basada en Alpine) y la publicación automática de la imagen resultante en **GitHub Container Registry (GHCR)** mediante un pipeline en GitHub Actions.

---

## 🛠️ Tecnologías y Herramientas Utilizadas
* **Lenguaje:** Python 3.12
* **Framework Web:** Flask (Renderizado dinámico con `render_template_string`)
* **Diseño UI:** Bootstrap 5 con estilos CSS personalizados (Gradientes y tarjetas flotantes módernicas)
* **Pruebas Unitarias:** Pytest 8.x
* **Contenedorización:** Docker (Imagen base: `python:3.12-alpine`)
* **Orquestación CI/CD:** GitHub Actions & GitHub Container Registry (GHCR)

---

## 📁 Estructura del Repositorio
La arquitectura de archivos se estructuró de la siguiente manera para cumplir con los estándares solicitados:
```text
Tarea3.0/
├── .github/
│   └── workflows/
│       └── python-application.yml     # Flujo automatizado de CI/CD
├── app.py                             # Código fuente principal de la Micro-API Flask
├── test_app.py                        # Suite de pruebas automatizadas (Pytest)
├── requirements.txt                   # Dependencias del proyecto (Flask, Pytest)
├── Dockerfile                         # Instrucciones de construcción de la imagen de Docker
└── README.md                          # Documentación del proyecto