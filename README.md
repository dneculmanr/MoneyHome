# 🔧 Actualización de Estructura y Base de Datos – MoneyHome

## 🧱 Cambios en la Base de Datos

Se realizó una normalización de la tabla `movimientos`, eliminando el uso de la columna `tipo` (string) y reemplazándola por una relación con la tabla `tipo_movimiento` mediante `tipo_id`.

### Pasos para actualizar la base de datos:

```sql
-- 1. Verificar datos actuales
SELECT * FROM movimientos;

-- 2. (Opcional) respaldo
CREATE TABLE movimientos_backup AS SELECT * FROM movimientos;

-- 3. Eliminar columna antigua
ALTER TABLE movimientos DROP COLUMN tipo;

-- 4. Validar estructura final
DESCRIBE movimientos;
```

### ✅ Estructura final esperada:

* user_id
* monto
* categoria_id
* tipo_id
* fecha
* descripcion

---

## ⚙️ Cambios en Backend (Flask)

* Se estandarizó el uso de `user_id` en lugar de `usuario_id`.
* Se eliminaron todas las referencias a `tipo` (string).
* Se implementó correctamente la relación con `tipo_movimiento`.
* Se corrigieron múltiples rutas que generaban errores 404.
* Se agregaron nuevas funcionalidades:

  * CRUD completo de categorías
  * Edición de movimientos
  * Perfil editable
  * Reportes en Excel (openpyxl)

---

## 🎨 Cambios en la Estructura del Proyecto

Se reorganizó la estructura de carpetas para cumplir con las convenciones de Flask:

### 📁 Antes (incorrecto)

* HTML dentro de subcarpetas inconsistentes
* static dentro de templates ❌
* carpeta `Javascript` ❌

### 📁 Ahora (correcto)

```
/project
│
├── app.py
├── templates/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── mov.html
│   ├── categorias.html
│   ├── perfil.html
│   ├── reportes.html
│   └── editar_*.html
│
├── static/
│   ├── CSS/
│   ├── js/          ← (antes Javascript)
│   └── Imagenes/
```

### 🔑 Cambios clave:

* Los HTML ahora van **directamente dentro de `templates/`**
* La carpeta `static/` está **fuera de `templates/`**
* Se renombró:

  * `Javascript` → `js`

---

## 👤 Perfil de Usuario

* Edición de nombre, email y contraseña
* Actualización automática en sesión
* Redirección al dashboard tras guardar
* Implementación de mensajes flash

---

## 📊 Reportes

* Exportación a Excel funcional
* PDF pendiente de implementación

---

## 🚧 Pendientes

* Implementación de sistema de familia (multiusuario)
* Generación de reportes en PDF
* Mejoras de seguridad (hash de contraseñas)

---

## 🚀 Estado actual

✔ Sistema funcional
✔ CRUD completo
✔ Estructura ordenada
✔ Listo para continuar desarrollo

---

Proyecto en estado estable para continuar con nuevas funcionalidades.

