from flask import Flask, render_template, request, redirect, session
import mysql.connector
#rutas
app = Flask(__name__, template_folder='templates/HTML', static_folder='templates/static')
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
# RUTAS DE PRUEBA
# DASHBOARD
@app.route("/dashboard")
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
#Ruta Flask para el perfil del usuario.
@app.route("/perfil")
def perfil():
    if "user_id" not in session:
        return redirect("/login")
    return render_template("perfil.html")

#Categorias.

#Ruta Flask para ver las categorias.
@app.route("/categorias")
def categorias():
    if "user_id" not in session:
        return redirect("/login")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    #Trae todas las categorias ordenadas por nombre.
    cursor.execute("""
        SELECT id, nombre
        FROM categorias
        ORDER BY nombre
    """)
    categorias = cursor.fetchall()

    conn.close()

    return render_template("categorias.html", categorias=categorias)

#MODAL CREAR CATEGORIAS
@app.route("/categorias/crear", methods=["POST"])
def crear_categoria():
    if "user_id" not in session:
        return redirect("/login")

    nombre = request.form.get("nombre", "").strip()

    if not nombre:
        return redirect("/categorias")

    conn = get_db_connection()
    cursor = conn.cursor()
    #Inserta una nueva categoría con el nombre.
    cursor.execute(
        "INSERT INTO categorias (nombre) VALUES (%s)",
        (nombre,)
    )

    conn.commit()
    conn.close()

    return redirect("/categorias")  

#MODAL EDITAR CATEGORIAS
@app.route("/categorias/editar/<int:id>", methods=["POST"])
def editar_categoria(id):
    if "user_id" not in session:
        return redirect("/login")

    nombre = request.form.get("nombre", "").strip()

    if not nombre:
        return redirect("/categorias")

    conn = get_db_connection()
    cursor = conn.cursor()
    #Actualiza el nombre de la categoría con el id especificado.
    cursor.execute(
        "UPDATE categorias SET nombre = %s WHERE id = %s",
        (nombre, id)
    )

    conn.commit()
    conn.close()

    return redirect("/categorias")

#MODAL ELIMINAR CATEGORIAS
@app.route("/categorias/eliminar/<int:id>", methods=["POST"])
def eliminar_categoria(id):
    if "user_id" not in session:
        return redirect("/login")

    conn = get_db_connection()
    cursor = conn.cursor()
    #Elimina la categoría con el id especificado.
    cursor.execute(
        "DELETE FROM categorias WHERE id = %s",
        (id,)
    )

    conn.commit()
    conn.close()

    return redirect("/categorias")

# Ruta para ver los movimientos.
@app.route("/mov", methods=["GET", "POST"])
@app.route("/mov/<tipo>", methods=["GET", "POST"])

def mov(tipo=None):
    # Verificar si el usuario está autenticado, sino redirige al login.
    if "user_id" not in session:
        return redirect("/login")

    # db_tipo: valor buscado en la BD (para filtrar el movimiento).
    # label: texto que mostrara en la pantalla.
    # descripcion: texto para la vista (descripción de lo que se muestra en la pantalla).
    opciones = {
        "ingresos": {"db_tipo":"ingreso", "label":"Ingresos","descripcion":"lista de ingresos"},
        "gastos": {"db_tipo":"gasto", "label":"Gastos","descripcion":"lista de gastos"},
        "transferencias": {"db_tipo":"transferencia", "label":"Transferencias","descripcion":"lista de transferencias"},
        "crear": {"db_tipo":None, "label":"Crear Movimiento","descripcion":"Formulario para crear un nuevo movimiento"}
    }

    # Si el tipo no esta en las op. redirige a /mov.
    if tipo and tipo not in opciones:
        return redirect("/mov")
    
#CREAR MOV.
    if tipo == "crear" and request.method == "POST":
        tipo_movimiento = request.form.get("tipo_movimiento", "").strip().lower()
        descripcion = request.form.get("descripcion", "").strip()
        monto_raw = request.form.get("monto", "").strip()
        categoria_id = request.form.get("categoria_id")

        if tipo_movimiento not in ["ingreso", "gasto"]:
            return redirect("/mov/crear")
    
        try:
            monto = float(monto_raw)
        except ValueError:
            return redirect("/mov/crear")
    
        if monto <= 0:
            return redirect("/mov/crear")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
                """
                INSERT INTO movimientos (usuario_id, monto, categoria_id, descripcion, tipo)
                VALUES (%s, %s, %s, %s, %s)
                """,
            (session["user_id"], monto, categoria_id, descripcion, tipo_movimiento))

        conn.commit()
        conn.close()


        return redirect("/mov/ingresos" if tipo_movimiento == "ingreso" else "/mov/gastos")




    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    #Si el tipo de movimento no esta vacio y tiene un valor en la BD, en tonces se realiza la consulta:
        # * traer filas de movimientos 
        # * unir con categorias para obtener el nombre de la categoría
        # * filtrar por usuario_id
        # * filtrar por tipo
        # * ordenar por fecha descendente

    if tipo and opciones[tipo]["db_tipo"]:
        cursor.execute("""
            SELECT 
                m.*, 
                c.nombre AS categoria
            FROM movimientos m
            LEFT JOIN categorias c ON m.categoria_id = c.id
            WHERE m.usuario_id = %s AND m.tipo = %s
            ORDER BY m.fecha DESC
        """, (session["user_id"], opciones[tipo]["db_tipo"]))
        movimientos = cursor.fetchall()
    else:
        cursor.execute("""
            SELECT 
                m.*, 
                c.nombre AS categoria
            FROM movimientos m
            LEFT JOIN categorias c ON m.categoria_id = c.id
            WHERE m.usuario_id = %s
            ORDER BY m.fecha DESC
        """, (session["user_id"],))
        movimientos = cursor.fetchall()

    cursor.execute("""
        SELECT id, nombre
        FROM categorias
        ORDER BY nombre
    """)
    categorias = cursor.fetchall()

    conn.close()

    selected_label = opciones[tipo]["label"] if tipo else "Movimientos"
    descripcion = opciones[tipo]["descripcion"] if tipo else "selecciona una opcion"
    

    return render_template(
        "mov.html",
        selected_key=tipo,
        selected_label=selected_label,
        descripcion=descripcion,
        movimientos=movimientos,
        categorias=categorias
    )

#MODAL EDITAR MOVIMIENTO

#Funcion del boton "Modificar".
@app.route("/mov/editar/<int:id>", methods=["POST"])
def editar_movimiento(id):
    if "user_id" not in session:
        return redirect("/login")
    # Obtener datos del formulario (NOMBRE, MONTO, CATEGORIA); strip()=quita espacio al inicio y al final.
    descripcion = request.form.get("descripcion", "").strip()
    monto_raw = request.form.get("monto", "").strip()
    categoria_id = request.form.get("categoria_id")

    # Validar monto numerico.
    try:
        monto = float(monto_raw)
    except ValueError:
        return "Debe ingresar un monto válido"
    # Validar monto positivo.
    if monto <= 0:
        return "Debe ingresar un monto positivo"

    conn = get_db_connection()
    cursor = conn.cursor()

    #Actializa nombre, monto y categoria del movimiento con el id especificado, solo si el movimiento pertenece al usuario autenticado.
    cursor.execute(
        """
        UPDATE movimientos
        SET descripcion = %s, monto = %s, categoria_id = %s
        WHERE id = %s AND usuario_id = %s
        """,
        (descripcion, monto, categoria_id, id, session["user_id"])
    )

    conn.commit()
    conn.close()

    return redirect("/mov")


#Funcion del boton "Eliminar".
@app.route("/mov/eliminar/<int:id>", methods=["POST"])
def eliminar_movimiento(id):
    if "user_id" not in session:
        return redirect("/login")

    conn = get_db_connection()
    cursor = conn.cursor()

    #Elimina el movimiento con el id especificado, solo si el movimiento pertenece al usuario autenticado.
    cursor.execute(
        """
        DELETE FROM movimientos
        WHERE id = %s AND usuario_id = %s
        """,
        (id, session["user_id"])
    )

    conn.commit()
    conn.close()

    return redirect("/mov")

if __name__ == "__main__":
    app.run(debug=True)    


