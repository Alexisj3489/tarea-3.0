"""
Backend - CRUD de usuarios
Proyecto Final: Despliegue de una Aplicacion en un VPS

Expone endpoints REST para registrar, listar, actualizar y eliminar
usuarios. Se conecta a PostgreSQL usando variables de entorno.
"""
import os

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

import models
import schemas
from database import Base, SessionLocal, engine, wait_for_db

app = FastAPI(title="API Usuarios - Proyecto Final VPS", version="3.0.0")

# Los origenes permitidos se configuran por variable de entorno para no
# hardcodear el subdominio del frontend dentro de la imagen.
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@app.on_event("startup")
def on_startup():
    wait_for_db()
    Base.metadata.create_all(bind=engine)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok", "service": "backend"}


@app.post("/api/usuarios", response_model=schemas.UsuarioOut, status_code=status.HTTP_201_CREATED, tags=["usuarios"])
def registrar_usuario(payload: schemas.UsuarioCreate):
    db = SessionLocal()
    try:
        nuevo = models.Usuario(
            nombre=payload.nombre,
            email=payload.email,
            password_hash=pwd_context.hash(payload.password),
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ese correo ya esta registrado")
    finally:
        db.close()


@app.get("/api/usuarios", response_model=list[schemas.UsuarioOut], tags=["usuarios"])
def listar_usuarios():
    db = SessionLocal()
    try:
        usuarios = db.scalars(select(models.Usuario).order_by(models.Usuario.id)).all()
        return usuarios
    finally:
        db.close()


@app.get("/api/usuarios/{usuario_id}", response_model=schemas.UsuarioOut, tags=["usuarios"])
def obtener_usuario(usuario_id: int):
    db = SessionLocal()
    try:
        usuario = db.get(models.Usuario, usuario_id)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return usuario
    finally:
        db.close()


@app.put("/api/usuarios/{usuario_id}", response_model=schemas.UsuarioOut, tags=["usuarios"])
def actualizar_usuario(usuario_id: int, payload: schemas.UsuarioUpdate):
    db = SessionLocal()
    try:
        usuario = db.get(models.Usuario, usuario_id)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        if payload.nombre is not None:
            usuario.nombre = payload.nombre
        if payload.email is not None:
            usuario.email = payload.email
        db.commit()
        db.refresh(usuario)
        return usuario
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ese correo ya esta registrado")
    finally:
        db.close()


@app.delete("/api/usuarios/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["usuarios"])
def eliminar_usuario(usuario_id: int):
    db = SessionLocal()
    try:
        usuario = db.get(models.Usuario, usuario_id)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        db.delete(usuario)
        db.commit()
    finally:
        db.close()
