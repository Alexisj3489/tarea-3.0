// API_BASE_URL viene inyectado por config.js (generado en el arranque del
// contenedor a partir de la variable de entorno API_BASE_URL, ver Dockerfile).
const API_BASE = window.API_BASE_URL || "http://localhost:8000";

const el = (id) => document.getElementById(id);
const statusDot = el("status-dot");
const statusText = el("status-text");
const apiHostLabel = el("api-host");

function showApiHost() {
  try {
    apiHostLabel.textContent = new URL(API_BASE).host;
  } catch {
    apiHostLabel.textContent = API_BASE;
  }
}

async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    if (!res.ok) throw new Error("bad status");
    statusDot.className = "status-dot ok";
    statusText.textContent = "backend conectado";
  } catch {
    statusDot.className = "status-dot err";
    statusText.textContent = "backend sin respuesta";
  }
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
}

async function cargarUsuarios() {
  const tbody = el("usuarios-body");
  tbody.innerHTML = `<tr><td colspan="5" class="empty">Cargando usuarios…</td></tr>`;
  try {
    const res = await fetch(`${API_BASE}/api/usuarios`, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo obtener la lista");
    const usuarios = await res.json();

    if (usuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty">Aún no hay usuarios registrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = usuarios
      .map(
        (u) => `
      <tr data-id="${u.id}">
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td>${u.email}</td>
        <td>${formatDate(u.creado_en)}</td>
        <td><button class="row-del" data-id="${u.id}">eliminar</button></td>
      </tr>`
      )
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">Error al cargar usuarios: ${err.message}</td></tr>`;
  }
}

async function eliminarUsuario(id) {
  try {
    const res = await fetch(`${API_BASE}/api/usuarios/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) throw new Error("No se pudo eliminar");
    await cargarUsuarios();
  } catch (err) {
    alert(`Error al eliminar: ${err.message}`);
  }
}

el("usuarios-body").addEventListener("click", (e) => {
  const btn = e.target.closest(".row-del");
  if (!btn) return;
  const id = btn.dataset.id;
  if (confirm(`¿Eliminar usuario #${id}?`)) eliminarUsuario(id);
});

el("refresh-btn").addEventListener("click", cargarUsuarios);

el("registro-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = el("form-msg");
  const btn = el("submit-btn");
  msg.textContent = "";
  msg.className = "form-msg";

  const payload = {
    nombre: el("nombre").value.trim(),
    email: el("email").value.trim(),
    password: el("password").value,
  };

  btn.disabled = true;
  btn.textContent = "Registrando…";

  try {
    const res = await fetch(`${API_BASE}/api/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(detail.detail || `Error ${res.status}`);
    }

    msg.textContent = "Usuario registrado correctamente.";
    msg.className = "form-msg ok";
    e.target.reset();
    await cargarUsuarios();
  } catch (err) {
    msg.textContent = err.message;
    msg.className = "form-msg err";
  } finally {
    btn.disabled = false;
    btn.textContent = "Registrar usuario";
  }
});

showApiHost();
checkHealth();
cargarUsuarios();
setInterval(checkHealth, 15000);
