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
        return render_template("index.html", user_id=session["user_id"])
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