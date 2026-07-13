from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UsuarioCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UsuarioUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None


class UsuarioOut(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    creado_en: datetime | None = None

    class Config:
        from_attributes = True
