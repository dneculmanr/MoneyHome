# 💰 MoneyHome - Sistema de Finanzas del Hogar

## 📌 Descripción

**MoneyHome** es una aplicación web desarrollada en **Python con Flask** que permite gestionar de forma simple y eficiente las finanzas del hogar.

El sistema permite registrar ingresos y gastos, organizarlos por categorías y generar **reportes en Excel y PDF**, facilitando el control financiero del usuario.

---

## 🚀 Características

* Registro de usuarios 🔐
* Inicio de sesión
* Registro de ingresos y gastos 💵💸
* Clasificación por categorías
* Visualización de movimientos
* Cálculo automático de saldo
* Dashboard con resumen financiero
* Exportación de reportes:

  * 📊 Excel (openpyxl)
  * 📄 PDF

---

## 🛠️ Tecnologías utilizadas

* Python 3
* Flask
* MySQL
* mysql-connector-python
* openpyxl (generación de reportes en Excel)

---

## ⚙️ Requisitos

Antes de ejecutar el sistema, asegúrate de tener instalado:

* Python 3
* MySQL Server
* MySQL Workbench (opcional)
* Visual Studio Code (recomendado)

---

## 🧱 Configuración de la Base de Datos

### 1. Iniciar MySQL

1. Abrir **MySQL Workbench**
2. Conectarse a `Local instance MySQL80`
3. Ingresar la contraseña del usuario `root`

---

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

CREATE TABLE tipo_movimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20),
    tipo INT
);

CREATE TABLE movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    monto DECIMAL(10,2),
    categoria_id INT,
    tipo_movimiento_id INT,
    fecha DATE,
    descripcion TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (tipo_movimiento_id) REFERENCES tipo_movimiento(id)
);
```

---

### 3. Insertar datos iniciales

```sql
INSERT INTO categorias (nombre) VALUES
('Alimentación'),
('Transporte'),
('Ocio'),
('Salud');

INSERT INTO tipo_movimiento (nombre, tipo) VALUES
('Ingreso', 1),
('Egreso', 2);
```

---

## 🔌 Configuración del Proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/dneculmanr/MoneyHome.git
cd MoneyHome
```

---

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

> Si no tienes el archivo `requirements.txt`, puedes instalar manualmente:

```bash
pip install flask mysql-connector-python openpyxl
```

---

## ▶️ Ejecución del Sistema

### 1. Configurar conexión a la base de datos

En el archivo `app.py`, verificar:

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

```bash
python app.py
```

---

### 3. Acceder desde el navegador

http://127.0.0.1:5000

---

## 📊 Generación de Reportes

El sistema permite exportar información financiera en:

* **Excel (.xlsx)** mediante la librería `openpyxl`
* **PDF** para visualización y respaldo

Los reportes incluyen datos como:

* Ingresos
* Gastos
* Categorías
* Fechas
* Balance total

---

## 🧪 Notas

* MySQL debe estar en ejecución
* No es necesario mantener abierto MySQL Workbench
* Flask utiliza un servidor de desarrollo (no productivo)

---

## 🚀 Estado del Proyecto

**Versión actual:** MVP (Producto Mínimo Viable)

Incluye funcionalidades esenciales para la gestión de finanzas del hogar, con posibilidad de expansión futura.

---

## 🔮 Mejoras futuras

* Migración a arquitectura más modular
* Implementación de API REST
* Mejoras en la interfaz de usuario
* Sistema de reportes avanzados (gráficos)
* Deploy en la nube

---

## 👨‍💻 Autores

* Daniel Neculman
* Paula Matamala

---

## 📌 Observaciones

Este sistema fue desarrollado con fines académicos, aplicando conceptos de:

* Desarrollo web
* Bases de datos relacionales
* Arquitectura de software
* Metodologías ágiles

---

## 📄 Licencia

Proyecto de uso educativo y personal.

