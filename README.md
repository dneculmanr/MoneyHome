💰 MoneyHome v1.1 - Sistema de Finanzas del Hogar

📌 Descripción  
MoneyHome es una aplicación web desarrollada en Python con Flask que permite a los usuarios registrar y gestionar sus ingresos y gastos del hogar, visualizar su saldo y organizar sus movimientos mediante categorías.

---

⚙️ Requisitos  
Antes de ejecutar el sistema, asegúrate de tener instalado:

- Python 3  
- MySQL Server  
- MySQL Workbench (opcional)  
- Visual Studio Code  

---

🧱 Configuración de la Base de Datos  

### 1. Iniciar MySQL
- Abrir MySQL Workbench  
- Conectarse a Local instance MySQL80  
- Ingresar contraseña del usuario root  

### 2. Crear la base de datos

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

Insertar Datos Iniciales

INSERT INTO categorias (nombre) VALUES
('Alimentación'),
('Transporte'),
('Ocio'),
('Salud'),
('Otros');


## 📌 Observaciones

El sistema fue desarrollado con fines académicos, aplicando conceptos de desarrollo web, bases de datos relacionales y metodologías ágiles.
