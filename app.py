from flask import Flask, render_template, request, redirect, session, send_file, flash
from openpyxl import Workbook
from io import BytesIO
import mysql.connector

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
            SET descripcion=%s, monto=%s, categoria_id=%s
            WHERE id=%s AND user_id=%s
        """, (
            request.form['descripcion'],
            request.form['monto'],
            request.form['categoria_id'],
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

# REPORTE GASTOS MENSUALES.
@app.route("/reporte/gastos_mensuales/excel")
def reporte_gastos_mensuales_excel():
    if "user_id" not in session:
        return redirect("/login")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT
            DATE_FORMAT(fecha, '%%Y-%%m') AS mes,
            c.nombre AS categoria,
            SUM(m.monto) AS total_gastos
        FROM movimientos m
        LEFT JOIN categorias c ON m.categoria_id = c.id
        WHERE m.user_id = %s AND m.tipo_id = 2
        GROUP BY mes, categoria
        ORDER BY mes DESC, total_gastos DESC
    """, (session["user_id"],))
    filas = cursor.fetchall()
    conn.close()
    # Crear un libro de Excel y una hoja.
    wb = Workbook()
    ws = wb.active
    ws.title = "Gastos Mensuales"

    ws.append(["Mes", "Categoria", "Total Gastos"])
    # Agregar filas al Excel.
    for f in filas:
        ws.append([
            f["mes"],
            f["categoria"] if f["categoria"] else "Sin categoria",
            float(f["total_gastos"] or 0)
        ])

    archivo = BytesIO()
    wb.save(archivo)
    archivo.seek(0)

    return send_file(
        archivo,
        as_attachment=True,
        download_name="gastos_mensuales.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# =========================
# RUN
# =========================
if __name__ == '__main__':
    app.run(debug=True)