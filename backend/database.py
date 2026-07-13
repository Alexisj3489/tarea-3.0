"""
Configuracion de conexion a la base de datos.
Todos los valores se leen desde variables de entorno, las cuales se
definen en stack.yml al desplegar el servicio en Docker Swarm.
"""
import os
import time

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base, sessionmaker

DB_USER = os.getenv("DB_USER", "appuser")
DB_PASSWORD = os.getenv("DB_PASSWORD", "changeme")
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "appdb")

DATABASE_URL = (
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def wait_for_db(retries: int = 15, delay: int = 2) -> None:
    """Reintenta la conexion mientras el contenedor de Postgres termina de iniciar."""
    for attempt in range(1, retries + 1):
        try:
            conn = engine.connect()
            conn.close()
            print("Conexion a la base de datos establecida.")
            return
        except OperationalError:
            print(f"Base de datos no disponible aun (intento {attempt}/{retries})...")
            time.sleep(delay)
    raise RuntimeError("No se pudo conectar a la base de datos despues de varios intentos.")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
