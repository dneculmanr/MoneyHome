💰 MoneyHome - Sistema de Finanzas del Hogar
📌 Descripción

MoneyHome es una aplicación web desarrollada en Python + Flask que permite gestionar de forma simple y eficiente las finanzas del hogar.

El sistema permite registrar ingresos y gastos, organizarlos por categorías, compartir información financiera entre usuarios y generar reportes, facilitando la toma de decisiones.

🚀 Características

🔐 Registro e inicio de sesión de usuarios
🔐 Recuperación de contraseña mediante correo electrónico (NUEVO)
💵 Registro de ingresos, gastos y transferencias
🗂️ Clasificación por categorías
📊 Dashboard con resumen financiero
📋 Visualización de movimientos
📈 Cálculo automático de saldo (incluye saldo inicial de banco)

👨‍👩‍👧 Sistema de familia (multiusuario)

Crear familia
Unirse mediante ID
Visualizar miembros
Compartir movimientos entre usuarios

📊 Exportación de reportes:

Excel (.xlsx)
PDF (en desarrollo)
🛠️ Tecnologías utilizadas
Python 3
Flask
MySQL
mysql-connector-python
openpyxl
reportlab (para PDF)
smtplib (envío de correos SMTP)
⚙️ Requisitos

Antes de ejecutar el sistema:

Python 3
MySQL Server
MySQL Workbench (opcional)
Visual Studio Code (recomendado)
🧱 Configuración de la Base de Datos
1. Crear base de datos
CREATE DATABASE moneyhome;
USE moneyhome;
2. Crear tablas
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
🆕 Cambios importantes (NUEVO)
ALTER TABLE usuarios
ADD COLUMN reset_token VARCHAR(255),
ADD COLUMN reset_expira DATETIME;

👉 Necesario para recuperación de contraseña

Bancos
CREATE TABLE tipo_cuenta ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE
);

CREATE TABLE tipo_banco ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE
);

CREATE TABLE banco (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tipo_banco_id INT NOT NULL,
    tipo_cuenta_id INT NOT NULL,
    nombre_banco VARCHAR(100) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (tipo_banco_id) REFERENCES tipo_banco(id),
    FOREIGN KEY (tipo_cuenta_id) REFERENCES tipo_cuenta(id)
);
ALTER TABLE movimientos
ADD COLUMN banco_id INT NOT NULL,
ADD CONSTRAINT fk_mov_banco FOREIGN KEY (banco_id) REFERENCES banco(id);
Pagos (NUEVO)
CREATE TABLE historial_pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_movimiento INT NOT NULL,
    fecha_pago DATE NOT NULL,
    monto_pago DECIMAL(12,2) NOT NULL,
    usuario VARCHAR(100),
    FOREIGN KEY (id_movimiento) REFERENCES movimientos(id)
);

CREATE TABLE estado_movimiento (
    id   TINYINT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL
);
ALTER TABLE movimientos 
ADD COLUMN estado_id TINYINT NOT NULL DEFAULT 1,
ADD CONSTRAINT fk_estado_mov FOREIGN KEY (estado_id) REFERENCES estado_movimiento(id);

3. CREAR LOS TRIGGER
-- Cada vez que se inserta un registro en historial_pagos, actumaticamante actualiza los movimeintos.
DELIMITER $$
CREATE TRIGGER actualizar_monto_pagado
AFTER INSERT ON historial_pagos
FOR EACH ROW
BEGIN
    UPDATE movimientos
    SET monto_pagado = monto_pagado + NEW.monto_pago
    WHERE id = NEW.id_movimiento;
END$$
DELIMITER ;

--Actualizar banco cuando se registra un pago.
DELIMITER $$
CREATE TRIGGER actualizar_saldo_banco
AFTER INSERT ON historial_pagos
FOR EACH ROW
BEGIN
    UPDATE banco
    SET saldo_actual = saldo_actual - NEW.monto_pago
    WHERE id = NEW.id_banco;
END$$
DELIMITER ;

4. POBLAR TABLAS

-- Poblar tabla estado_movimiento
INSERT INTO estado_movimiento VALUES (1, 'Pendiente'), (2, 'Pagado'), (3, 'Parcial');

--Poblar tabla tipo_banco
INSERT INTO tipo_banco (id, nombre) VALUES
(3,  'Banco BCI'),
(12, 'Banco BTG Pactual Chile'),
(10, 'Banco Consorcio'),
(13, 'Banco Coopeuch'),
(1,  'Banco de Chile'),
(9,  'Banco Falabella'),
(11, 'Banco Internacional'),
(5,  'Banco Itaú Chile'),
(8,  'Banco Ripley'),
(4,  'Banco Santander Chile'),
(7,  'Banco Security'),
(2,  'BancoEstado'),
(6,  'Scotiabank Chile');

--Poblar tipo_cuenta
INSERT INTO tipo_cuenta (id, nombre) VALUES
(1, 'Cuenta Corriente'),
(2, 'Cuenta de Ahorro'),
(4, 'Cuenta RUT'),
(3, 'Cuenta Vista');

--Poblar tipo_movimeinto
INSERT INTO tipo_movimiento (id, nombre) VALUES
(1, 'ingreso'),
(2, 'gasto'),
(3, 'transferencia');


🔌 Configuración del Proyecto
1. Clonar repositorio
git clone https://github.com/dneculmanr/MoneyHome.git
cd MoneyHome
2. Instalar dependencias
pip install -r requirements.txt

Si no existe:

pip install flask mysql-connector-python openpyxl reportlab
📧 Configuración de correo (SMTP Gmail) 🔥 NUEVO

Para habilitar recuperación de contraseña:

Crear un correo Gmail (ej: moneyhomemain@gmail.com)
Activar verificación en 2 pasos
Generar App Password

Luego en app.py:

remitente = "moneyhomemain@gmail.com"
password = "TU_APP_PASSWORD"

⚠️ Importante:

NO usar contraseña normal
NO compartir credenciales
No requiere instalar librerías extra
▶️ Ejecución
1. Configurar conexión en app.py
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="TU_PASSWORD",
        database="moneyhome"
    )
2. Ejecutar
python app.py
3. Abrir en navegador
http://127.0.0.1:5000
📊 Reportes

El sistema permite exportar información financiera en:

📊 Excel (.xlsx)
📄 PDF (en desarrollo)

Incluye:

Ingresos
Gastos
Categorías
Balance total
🧪 Notas
MySQL debe estar en ejecución
No es necesario mantener abierto Workbench
Flask utiliza un servidor de desarrollo
🚀 Estado del Proyecto

Versión actual: MVP Avanzado

✔ Sistema funcional
✔ CRUD completo
✔ Multiusuario (familia)
✔ Sistema de bancos
✔ Reportes Excel
✔ Recuperación de contraseña por correo
✔ UX mejorada (alerts y validaciones)
✔ Integración SMTP real

🔮 Mejoras futuras
Hash de contraseñas
Dashboard con gráficos
Roles dentro de familia
Deploy en la nube
PDF completo
👨‍💻 Autores

Daniel Neculman
Paula Matamala

📌 Observaciones

Proyecto desarrollado con fines académicos aplicando:

Desarrollo web
Bases de datos relacionales
Arquitectura de software
Metodologías ágiles
📄 Licencia

Uso educativo y personal
