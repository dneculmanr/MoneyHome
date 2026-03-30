# 💰 MoneyHome - Sistema de Finanzas del Hogar

## 📌 Descripción

MoneyHome es una aplicación web desarrollada en Python con Flask que permite a los usuarios registrar y gestionar sus ingresos y gastos del hogar, visualizar su saldo y organizar sus movimientos mediante categorías.

---

## ⚙️ Requisitos

Antes de ejecutar el sistema, asegúrate de tener instalado:

* Python 3
* MySQL Server
* MySQL Workbench (opcional)
* Visual Studio Code

---

## 🧱 Configuración de la Base de Datos

### 1. Iniciar MySQL

* Abrir MySQL Workbench
* Conectarse a `Local instance MySQL80`
* Ingresar contraseña del usuario root

### 2. Crear la base de datos

Ejecutar el siguiente script SQL:

```sql
CREATE DATABASE moneyhome;
USE moneyhome;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tipo ENUM('ingreso','gasto'),
    monto DECIMAL(10,2),
    categoria_id INT,
    fecha DATE,
    descripcion TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);
```

### 3. Insertar datos iniciales (opcional)

```sql
INSERT INTO categorias (nombre) VALUES
('Alimentación'),
('Transporte'),
('Ocio'),
('Salud');
```

---

## 🔌 Configuración del Proyecto

### 1. Abrir proyecto en VS Code

* Abrir la carpeta del proyecto

### 2. Abrir terminal

En VS Code:

```
Terminal → New Terminal
```

### 3. Instalar dependencias

```bash
pip install flask mysql-connector-python
```

---

## ▶️ Ejecución del Sistema

### 1. Verificar conexión en `app.py`

Asegurarse de que los datos coincidan con tu configuración:

```python
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="TU_PASSWORD",
        database="moneyhome"
    )
```

---

### 2. Ejecutar la aplicación

En la terminal:

```bash
python app.py
```

---

### 3. Abrir en el navegador

Ir a:

```
http://127.0.0.1:5000
```

---

## 🔐 Funcionalidades

* Registro de usuario
* Inicio de sesión
* Registro de ingresos y gastos
* Clasificación por categorías
* Visualización de movimientos
* Cálculo automático de saldo
* Dashboard con resumen financiero

---

## 🧪 Notas

* MySQL debe estar en ejecución para que la aplicación funcione
* No es necesario mantener abierto MySQL Workbench
* Este proyecto utiliza un servidor de desarrollo (Flask)

---

## 🚀 Estado del Proyecto

Versión actual: MVP (Producto Mínimo Viable)

Incluye funcionalidades básicas para la gestión de finanzas del hogar.

---

## 👨‍💻 Autores

* Daniel Neculman
* Paula Matamala

---

## 📌 Observaciones

El sistema fue desarrollado con fines académicos, aplicando conceptos de desarrollo web, bases de datos relacionales y metodologías ágiles.
