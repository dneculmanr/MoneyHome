# 💰 MoneyHome - Sistema de Finanzas del Hogar

---

## 📌 Descripción

MoneyHome es una aplicación web desarrollada en **Python + Flask** que permite gestionar de forma simple y eficiente las finanzas del hogar.

El sistema permite registrar ingresos y gastos, organizarlos por categorías, compartir información financiera entre usuarios y generar reportes, facilitando la toma de decisiones.

---

## 🚀 Características

🔐 Registro e inicio de sesión de usuarios
💵 Registro de ingresos, gastos y transferencias
🗂️ Clasificación por categorías
📊 Dashboard con resumen financiero
📋 Visualización de movimientos
📈 Cálculo automático de saldo

👨‍👩‍👧 **Sistema de familia (multiusuario)**

* Crear familia
* Unirse mediante ID
* Visualizar miembros
* Compartir movimientos entre usuarios

📊 Exportación de reportes:

* Excel (.xlsx)
* PDF (en desarrollo)

---

## 🛠️ Tecnologías utilizadas

* Python 3
* Flask
* MySQL
* mysql-connector-python
* openpyxl

---

## ⚙️ Requisitos

Antes de ejecutar el sistema:

* Python 3
* MySQL Server
* MySQL Workbench (opcional)
* Visual Studio Code (recomendado)

---

## 🧱 Configuración de la Base de Datos

### 1. Crear base de datos

```sql id="k2k2o0"
CREATE DATABASE moneyhome;
USE moneyhome;
```

---

### 2. Crear tablas

```sql id="nlb4xz"
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    familia_id INT
);

CREATE TABLE familia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE tipo_movimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20)
);

CREATE TABLE movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    monto DECIMAL(10,2),
    categoria_id INT,
    tipo_id INT,
    fecha DATE,
    descripcion TEXT,
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (tipo_id) REFERENCES tipo_movimiento(id)
);

ALTER TABLE usuarios
ADD CONSTRAINT fk_familia
FOREIGN KEY (familia_id) REFERENCES familia(id);
```

---

### 3. Datos iniciales

```sql id="zzp7tt"
INSERT INTO categorias (nombre) VALUES
('Alimentación'),
('Transporte'),
('Ocio'),
('Salud'),
('Otros');

INSERT INTO tipo_movimiento (nombre) VALUES
('ingreso'),
('gasto'),
('transferencia');
```

---

## 🔌 Configuración del Proyecto

### 1. Clonar repositorio

```bash id="g3kbvx"
git clone https://github.com/dneculmanr/MoneyHome.git
cd MoneyHome
```

---

### 2. Instalar dependencias

```bash id="t9w9bp"
pip install -r requirements.txt
```

Si no existe:

```bash id="b4z3lh"
pip install flask mysql-connector-python openpyxl
```

---

## ▶️ Ejecución

### 1. Configurar conexión en `app.py`

```python id="gq0vxm"
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="TU_PASSWORD",
        database="moneyhome"
    )
```

---

### 2. Ejecutar

```bash id="vldj68"
python app.py
```

---

### 3. Abrir en navegador

```id="2czj7p"
http://127.0.0.1:5000
```

---

## 📊 Reportes

El sistema permite exportar información financiera en:

📊 Excel (.xlsx)
📄 PDF (próximamente)

Incluye:

* Ingresos
* Gastos
* Categorías
* Balance total

## Para la descarga de reportes debe ejecurar

python -m pip install reportlab

---

## 🧪 Notas

* MySQL debe estar en ejecución
* No es necesario mantener abierto Workbench
* Flask utiliza un servidor de desarrollo

---

## 🚀 Estado del Proyecto

**Versión actual: MVP (Producto Mínimo Viable)**

✔ Sistema funcional
✔ CRUD completo
✔ Multiusuario (familia) implementado
✔ Reportes Excel operativos
✔ Estructura optimizada

---

## 🔮 Mejoras futuras

* Generación de reportes en PDF
* Autenticación segura (hash de contraseñas)
* Dashboard con gráficos
* Roles dentro de familia
* Deploy en la nube

---

## 👨‍💻 Autores

* Daniel Neculman
* Paula Matamala

---

## 📌 Observaciones

Proyecto desarrollado con fines académicos aplicando:

* Desarrollo web
* Bases de datos relacionales
* Arquitectura de software
* Metodologías ágiles

---

## 📄 Licencia

Uso educativo y personal.
