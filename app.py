from flask import Flask, render_template, request, redirect, session, send_file, flash
from openpyxl import Workbook
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.styles import Font
from io import BytesIO
import mysql.connector
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'secret123'

# =========================
# CONEXIÓN BD
# =========================
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="P_D_T_2026",
        database="moneyhome"
    )

# =========================
# LOGIN
# =========================
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM usuarios WHERE email=%s AND password=%s",
            (request.form['email'], request.form['password'])
        )

        user = cursor.fetchone()

        if user:
            session['user_id'] = user['id']
            session['usuario_nombre'] = user['nombre']
            return redirect('/')
        else:
            return "Credenciales incorrectas"

    return render_template('login.html')

# =========================
# REGISTER
# =========================
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO usuarios (nombre, email, password)
            VALUES (%s, %s, %s)
        """, (request.form['nombre'], request.form['email'], request.form['password']))

        conn.commit()
        return redirect('/login')

    return render_template('register.html')

# =========================
# LOGOUT
# =========================
@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

# =========================
# DASHBOARD (CON FAMILIA)
# =========================
@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect('/login')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Totales (solo del usuario por ahora)
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN tipo_id = 1 THEN monto ELSE 0 END) AS ingresos,
            SUM(CASE WHEN tipo_id = 2 THEN monto ELSE 0 END) AS gastos
        FROM movimientos
        WHERE user_id = %s
    """, (session['user_id'],))

    data = cursor.fetchone()
    ingresos = data['ingresos'] or 0
    gastos = data['gastos'] or 0
    saldo = ingresos - gastos

    # Movimientos (usuario + familia)
    cursor.execute("""
        SELECT m.*, c.nombre AS categoria, t.nombre AS tipo, u.nombre AS usuario
        FROM movimientos m
        LEFT JOIN categorias c ON m.categoria_id = c.id
        LEFT JOIN tipo_movimiento t ON m.tipo_id = t.id
        LEFT JOIN usuarios u ON m.user_id = u.id
        WHERE m.user_id = %s 
           OR u.familia_id = (
                SELECT familia_id FROM usuarios WHERE id = %s
           )
    """, (session['user_id'], session['user_id']))

    movimientos = cursor.fetchall()

    return render_template('index.html',
        ingresos=ingresos,
        gastos=gastos,
        saldo=saldo,
        movimientos=movimientos
    )

# =========================
# MOVIMIENTOS (CON FAMILIA)
# =========================
@app.route('/mov')
@app.route('/mov/<tipo>', methods=['GET', 'POST'])
def mov(tipo=None):

    if 'user_id' not in session:
        return redirect('/login')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # CREAR
    if tipo == 'crear' and request.method == 'POST':
        tipo_map = {'ingreso':1,'gasto':2,'transferencia':3}

        cursor.execute("""
            INSERT INTO movimientos (user_id, monto, categoria_id, tipo_id, fecha, descripcion)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (
            session['user_id'],
            request.form['monto'],
            request.form['categoria_id'],
            tipo_map.get(request.form['tipo_movimiento']),
            request.form['fecha'],
            request.form['descripcion']
        ))

        conn.commit()
        return redirect('/mov')

    cursor.execute("SELECT * FROM categorias")
    categorias = cursor.fetchall()

    filtro = ""
    if tipo == 'ingresos':
        filtro = "AND m.tipo_id=1"
    elif tipo == 'gastos':
        filtro = "AND m.tipo_id=2"
    elif tipo == 'transferencias':
        filtro = "AND m.tipo_id=3"

    cursor.execute(f"""
        SELECT m.*, c.nombre AS categoria, t.nombre AS tipo, u.nombre AS usuario
        FROM movimientos m
        LEFT JOIN categorias c ON m.categoria_id = c.id
        LEFT JOIN tipo_movimiento t ON m.tipo_id = t.id
        LEFT JOIN usuarios u ON m.user_id = u.id
        WHERE (m.user_id=%s 
           OR u.familia_id = (
                SELECT familia_id FROM usuarios WHERE id = %s
           ))
        {filtro}
    """,(session['user_id'], session['user_id']))

    movimientos = cursor.fetchall()

    return render_template('mov.html', movimientos=movimientos, categorias=categorias, tipo=tipo)

# =========================
# EDITAR MOVIMIENTO
# =========================
@app.route('/mov/editar/<int:id>', methods=['GET','POST'])
def editar_movimiento(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        cursor.execute("""
            UPDATE movimientos
            SET descripcion=%s, monto=%s, categoria_id=%s, fecha=%s
            WHERE id=%s AND user_id=%s
        """, (
            request.form['descripcion'],
            request.form['monto'],
            request.form['categoria_id'],
            request.form['fecha'],
            id,
            session['user_id']
        ))

        conn.commit()
        return redirect('/mov')

    cursor.execute("SELECT * FROM movimientos WHERE id=%s",(id,))
    movimiento = cursor.fetchone()

    cursor.execute("SELECT * FROM categorias")
    categorias = cursor.fetchall()

    return render_template('editar_movimiento.html',
        movimiento=movimiento,
        categorias=categorias
    )

# =========================
# CATEGORIAS
# =========================
@app.route('/categorias')
def categorias():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM categorias")
    categorias = cursor.fetchall()
    return render_template('categorias.html', categorias=categorias)

@app.route('/categorias/crear', methods=['POST'])
def crear_categoria():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO categorias (nombre) VALUES (%s)", (request.form['nombre'],))
    conn.commit()
    return redirect('/categorias')

@app.route('/categorias/editar/<int:id>', methods=['GET', 'POST'])
def editar_categoria(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        cursor.execute(
            "UPDATE categorias SET nombre = %s WHERE id = %s",
            (request.form['nombre'], id)
        )
        conn.commit()
        return redirect('/categorias')

    cursor.execute("SELECT * FROM categorias WHERE id = %s", (id,))
    categoria = cursor.fetchone()

    return render_template('editar_categoria.html', categoria=categoria)

@app.route('/categorias/eliminar/<int:id>', methods=['POST'])
def eliminar_categoria(id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM movimientos WHERE categoria_id=%s",(id,))
    count = cursor.fetchone()[0]

    if count > 0:
        flash("No puedes eliminar una categoría en uso", "danger")
        return redirect('/categorias')

    cursor.execute("DELETE FROM categorias WHERE id=%s",(id,))
    conn.commit()

    return redirect('/categorias')

# =========================
# FAMILIA
# =========================
@app.route('/familia', methods=['GET', 'POST'])
def familia():
    if 'user_id' not in session:
        return redirect('/login')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        cursor.execute("INSERT INTO familia (nombre) VALUES (%s)", (request.form['nombre'],))
        conn.commit()

        familia_id = cursor.lastrowid

        cursor.execute(
            "UPDATE usuarios SET familia_id=%s WHERE id=%s",
            (familia_id, session['user_id'])
        )
        conn.commit()

        return redirect('/familia')

    cursor.execute("""
        SELECT f.* FROM familia f
        JOIN usuarios u ON u.familia_id=f.id
        WHERE u.id=%s
    """,(session['user_id'],))

    familia = cursor.fetchone()

    miembros = []
    if familia:
        cursor.execute("SELECT nombre,email FROM usuarios WHERE familia_id=%s",(familia['id'],))
        miembros = cursor.fetchall()

    return render_template('familia.html', familia=familia, miembros=miembros)

# =========================
# PERFIL
# =========================
@app.route('/perfil', methods=['GET', 'POST'])
def perfil():
    if 'user_id' not in session:
        return redirect('/login')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        cursor.execute("""
            UPDATE usuarios
            SET nombre=%s, email=%s, password=%s
            WHERE id=%s
        """,(request.form['nombre'],request.form['email'],request.form['password'],session['user_id']))

        conn.commit()
        session['usuario_nombre'] = request.form['nombre']
        flash("Perfil actualizado correctamente", "success")

        return redirect('/')

    cursor.execute("SELECT * FROM usuarios WHERE id=%s",(session['user_id'],))
    usuario = cursor.fetchone()

    return render_template('perfil.html', usuario=usuario)

# =========================
# REPORTES
# =========================

#------------REPORTE GASTOS MENSUALES------------------

#Funcion que muentran los gastos menusuales del usuario, con su categoria y familia.
def obtener_filas_reporte_gastos_mensuales(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT
            c.nombre AS Categoria,
            m.descripcion AS Nombre,
            f.nombre AS Familia,
            DATE_FORMAT(m.fecha, '%m-%Y') AS Mes,
            m.monto AS Monto
        FROM movimientos m
        LEFT JOIN categorias c ON m.categoria_id = c.id
        LEFT JOIN usuarios u ON m.user_id = u.id
        LEFT JOIN familia f ON u.familia_id = f.id
        WHERE m.tipo_id = 2 AND m.user_id = %s
        ORDER BY Mes DESC
    """, (user_id,))
    filas = cursor.fetchall()
    conn.close()
    return filas

# Construir un resumen de gastos por mes a partir de las filas obtenidas.
def construir_resumen_por_mes(filas):
    resumen = {}
    for fila in filas:
        monto = float(fila["Monto"] or 0)
        mes = fila["Mes"]
        resumen[mes] = resumen.get(mes, 0) + monto
    # Ordenar el resumen por mes (formato MM-YYYY) de forma descendente.
    return sorted(
        resumen.items(),
        key=lambda item: datetime.strptime(item[0], "%m-%Y"),
        reverse=True
    )

# vista principal de reportes, con links a cada reporte específico.
@app.route("/reportes")
def reportes():
    if "user_id" not in session:
        return redirect("/login")
    return render_template("reportes.html")

# Visualizar reportes.
@app.route("/reportes/visualizar")
def visualizar_reportes():
    if "user_id" not in session:
        return redirect("/login")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    conn.close()

    return render_template("visualizar_reportes.html", reportes=reportes)


# EXCEL

@app.route("/reporte/gastos_mensuales/excel")
def reporte_gastos_mensuales_excel():
    if "user_id" not in session:
        return redirect("/login")

    filas = obtener_filas_reporte_gastos_mensuales(session["user_id"])
    # Crear un libro de Excel y una hoja.
    wb = Workbook()
    ws = wb.active
    ws.title = "Gastos Mensuales"

    # Primera fila vacía para que el encabezado inicie en B2.
    ws.append(["","", "Reporte de Gastos Mensuales"])
    ws.cell(row=ws.max_row, column=3).font = Font(size=16, bold=True)
    ws.append([])
    ws.append(["","Usuario:", session.get("usuario_nombre", "Desconocido"),"","Generado el:", datetime.now().strftime("%d-%m-%Y %H:%M")]) # Fecha de generación del reporte
    ws.append(["", "N°", "Mes", "Nombre", "Categoria", "Familia", "Monto"])
    header_row = ws.max_row

    resumen_por_mes = dict(construir_resumen_por_mes(filas))

    # Datos desde B3.
    for i, f in enumerate(filas, start=1):
        monto = float(f["Monto"] or 0)
        mes = f["Mes"]
        ws.append([
            "",
            i,
            mes,
            f["Nombre"],
            f["Categoria"] if f["Categoria"] else "Sin categoria",
            f["Familia"] if f["Familia"] else "Sin familia",
            monto
        ])
        ws.cell(row=ws.max_row, column=7).number_format = '#,##0'
        resumen_por_mes[mes] = resumen_por_mes.get(mes, 0) + monto

    # Convertir bloque principal en tabla (encabezado + datos).
    end_row = ws.max_row
    tabla = Table(displayName="TablaGastos", ref=f"B{header_row}:G{end_row}")
    tabla.tableStyleInfo = TableStyleInfo(
        name="TableStyleLight8", # Estilo de tabla.
        showFirstColumn=False,
        showLastColumn=False,
        showRowStripes=True,
        showColumnStripes=False
    )
    ws.add_table(tabla)

    # Resumen al final del reporte: total de gastos por mes.
    ws.append([])
    ws.append([])
    ws.append(["Resumen por mes:"])
    for celda in ws[ws.max_row]:
        celda.font = Font(size=14, bold=True)
    ws.append(["Mes", "Total Gastos"])
    fila = ws.max_row
    ws.cell(row=fila, column=1).font = Font(bold=True)
    ws.cell(row=fila, column=2).font = Font(bold=True)
    for mes in sorted(resumen_por_mes.keys(), reverse=True):
        ws.append([mes, resumen_por_mes[mes]])
        ws.cell(row=ws.max_row, column=2).number_format = '#,##0'

    #Guardar el libro de Excel en BytesIO.
    archivo = BytesIO()
    wb.save(archivo)
    archivo.seek(0)

    # Descargar el archivo excel.
    return send_file(
        archivo,
        as_attachment=True,
        download_name="Gastos_mensuales.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# =========================
# RUN
# =========================
if __name__ == '__main__':
    app.run(debug=True)