print("🔥 APP CORRECTA EJECUTÁNDOSE")

from flask import Flask, render_template, request, redirect, session, url_for
import mysql.connector

app = Flask(__name__, template_folder='templates/HTML', static_folder='static')
app.secret_key = "secretkey"

# ======================
# CONEXIÓN
# ======================
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="appuser",
        password="1234",
        database="moneyhome"
    )

# ======================
# HOME (DASHBOARD)
# ======================
@app.route("/")
def home():
    if "user_id" not in session:
        return redirect(url_for("login"))

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Movimientos
    cursor.execute("""
        SELECT m.*, c.nombre as categoria
        FROM movimientos m
        LEFT JOIN categorias c ON m.categoria_id = c.id
        WHERE m.user_id = %s
        ORDER BY m.fecha DESC
    """, (session["user_id"],))

    movimientos = cursor.fetchall()

    # Resumen
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN tipo='ingreso' THEN monto ELSE 0 END) as ingresos,
            SUM(CASE WHEN tipo='gasto' THEN monto ELSE 0 END) as gastos
        FROM movimientos
        WHERE user_id = %s
    """, (session["user_id"],))

    resumen = cursor.fetchone()

    ingresos = resumen["ingresos"] or 0
    gastos = resumen["gastos"] or 0
    saldo = ingresos - gastos

    conn.close()

    return render_template("dashboard.html",
                           movimientos=movimientos,
                           ingresos=ingresos,
                           gastos=gastos,
                           saldo=saldo)

# ======================
# MOVIMIENTOS
# ======================
@app.route("/movimientos")
def movimientos():
    if "user_id" not in session:
        return redirect(url_for("login"))

    tipo = request.args.get("tipo")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if tipo:
        cursor.execute("""
            SELECT m.*, c.nombre as categoria
            FROM movimientos m
            LEFT JOIN categorias c ON m.categoria_id = c.id
            WHERE m.user_id = %s AND m.tipo = %s
        """, (session["user_id"], tipo))
    else:
        cursor.execute("""
            SELECT m.*, c.nombre as categoria
            FROM movimientos m
            LEFT JOIN categorias c ON m.categoria_id = c.id
            WHERE m.user_id = %s
        """, (session["user_id"],))

    movimientos = cursor.fetchall()
    conn.close()

    return render_template("mov.html", movimientos=movimientos)

# ======================
# FORM CREAR
# ======================
@app.route("/crear")
def crear():
    if "user_id" not in session:
        return redirect(url_for("login"))

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM categorias")
    categorias = cursor.fetchall()

    conn.close()

    return render_template("crear_movimiento.html", categorias=categorias)

# ======================
# GUARDAR MOVIMIENTO
# ======================
@app.route("/crear_movimiento", methods=["POST"])
def crear_movimiento():
    if "user_id" not in session:
        return redirect(url_for("login"))

    try:
        tipo = request.form["tipo"]
        monto = request.form["monto"]
        categoria_id = request.form["categoria"]
        fecha = request.form["fecha"]
        descripcion = request.form["descripcion"]

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO movimientos (user_id, tipo, monto, categoria_id, fecha, descripcion)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (session["user_id"], tipo, monto, categoria_id, fecha, descripcion))

        conn.commit()
        conn.close()

        return redirect(url_for("home"))

    except Exception as e:
        return f"Error al guardar movimiento: {e}"

# ======================
# LOGIN
# ======================
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM usuarios WHERE email = %s AND password = %s",
            (email, password)
        )

        user = cursor.fetchone()
        conn.close()

        if user:
            session["user_id"] = user["id"]
            return redirect(url_for("home"))
        else:
            return render_template("login.html", error="Credenciales incorrectas")

    return render_template("login.html")

# ======================
# REGISTER
# ======================
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        nombre = request.form["nombre"]
        email = request.form["email"]
        password = request.form["password"]

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO usuarios (nombre, email, password) VALUES (%s, %s, %s)",
            (nombre, email, password)
        )

        conn.commit()
        conn.close()

        return redirect(url_for("login"))

    return render_template("register.html")

# ======================
# LOGOUT
# ======================
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

# ======================
# RESET
# ======================
@app.route("/reset")
def reset():
    session.clear()
    return "Sesión limpiada"

# ======================
# RUN
# ======================
if __name__ == "__main__":
    app.run(debug=True)