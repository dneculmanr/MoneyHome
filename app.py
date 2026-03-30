from flask import Flask, render_template, request, redirect, session
import mysql.connector

app = Flask(__name__)
app.secret_key = "secretkey"

# Conexión MySQL
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="appuser",
        password="1234",
        database="moneyhome"
    )

# HOME
@app.route("/")
def index():
    if "user_id" in session:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Obtener movimientos
        cursor.execute("""
            SELECT * FROM movimientos 
            WHERE usuario_id = %s
        """, (session["user_id"],))

        movimientos = cursor.fetchall()

        # Calcular totales
        ingresos = sum(m["monto"] for m in movimientos if m["tipo"] == "ingreso")
        gastos = sum(m["monto"] for m in movimientos if m["tipo"] == "gasto")
        saldo = ingresos - gastos

        conn.close()

        return render_template(
            "index.html",
            user_id=session["user_id"],
            movimientos=movimientos,
            ingresos=ingresos,
            gastos=gastos,
            saldo=saldo
        )

    return redirect("/login")

# REGISTER
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

        return redirect("/login")

    return render_template("register.html")

# LOGIN
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
            return redirect("/")
        else:
            return "Credenciales incorrectas"

    return render_template("login.html")

# LOGOUT
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

# TEST DB
@app.route("/test-db")
def test_db():
    try:
        conn = get_db_connection()
        conn.close()
        return "✅ Conexión a MySQL OK"
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    app.run(debug=True)

@app.route("/")
def dashboard():
    if "user_id" not in session:
        return redirect("/login")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    user_id = session["user_id"]

    # Obtener movimientos
    cursor.execute("""
        SELECT m.*, c.nombre AS categoria
        FROM movimientos m
        LEFT JOIN categorias c ON m.categoria_id = c.id
        WHERE m.usuario_id = %s
        ORDER BY m.fecha DESC
    """, (user_id,))
    movimientos = cursor.fetchall()

    # Totales
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN tipo='ingreso' THEN monto ELSE 0 END) AS ingresos,
            SUM(CASE WHEN tipo='gasto' THEN monto ELSE 0 END) AS gastos
        FROM movimientos
        WHERE usuario_id = %s
    """, (user_id,))
    totales = cursor.fetchone()

    ingresos = totales["ingresos"] or 0
    gastos = totales["gastos"] or 0
    saldo = ingresos - gastos

    conn.close()

    return render_template("dashboard.html",
                           movimientos=movimientos,
                           ingresos=ingresos,
                           gastos=gastos,
                           saldo=saldo)    