document.addEventListener("DOMContentLoaded", function () {

    // ===== MENÚ HAMBURGUESA =====
    const toggleBtn = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener("click", function () {
            navMenu.classList.toggle("active");
        });
    }

    // ===== MODAL EDITAR CATEGORIA =====
    const modalEditarCategoria = document.getElementById("modalEditarCategoria");
    const formEditarCategoria = document.getElementById("formEditarCategoria");
    const btnEliminarCategoria = document.getElementById("btnEliminarCategoria");

    let categoriaId = null;

    if (modalEditarCategoria) {
        modalEditarCategoria.addEventListener("show.bs.modal", function (event) {
            const btn = event.relatedTarget;
            if (!btn) return;

            categoriaId = btn.getAttribute("data-id");
            const nombre = btn.getAttribute("data-nombre");

            document.getElementById("edit_categoria_nombre").value = nombre;

            formEditarCategoria.action = "/categorias/editar/" + categoriaId;
        });
    }

    if (btnEliminarCategoria) {
        btnEliminarCategoria.addEventListener("click", function () {
            if (confirm("¿Eliminar categoría?")) {
                fetch("/categorias/eliminar/" + categoriaId, {
                    method: "POST"
                }).then(() => location.reload());
            }
        });
    }




// =====banco
function actualizarNuevoSaldo() {
    var saldo = parseFloat(document.getElementById('saldo_disponible').value) || 0;
    var monto = parseFloat(document.getElementById('monto_origen_transferencia').value) || 0;
    document.getElementById('nuevo_saldo').value = saldo + monto;
}

// Cuando cambia el banco, actualiza el saldo y el nuevo saldo
document.getElementById('banco_origen').addEventListener('change', function() {
    var saldo = this.options[this.selectedIndex].getAttribute('data-saldo') || 0;
    // hace que el saldo se muestre con formato de miles
    document.getElementById('saldo_disponible').value = Number(saldo).toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});
    actualizarNuevoSaldo();
});

// Cuando cambia el monto, actualiza el nuevo saldo
document.getElementById('monto_origen_transferencia').addEventListener('input', actualizarNuevoSaldo);


//================================
//         TRANSFERENCIA
//================================

// ===== Función para limpiar separadores de miles =====
function limpiarNumero(valor) {
    return valor.replace(/[\.,]/g, '');
}

// ===== ORIGEN =====
function actualizarNuevoSaldoOrigen() {
    const saldoStr = document.getElementById('saldo_disponible').value || "0";
    const montoStr = document.getElementById('monto_origen_transferencia').value || "0";

    const saldo = parseFloat(limpiarNumero(saldoStr)) || 0;
    const monto = parseFloat(limpiarNumero(montoStr)) || 0;

    // En origen se RESTA el monto
    document.getElementById('nuevo_saldo').value = saldo - monto;
}

document.getElementById('banco_origen').addEventListener('change', function() {
    const saldo = this.options[this.selectedIndex].getAttribute('data-saldo') || "0";
    //hace que el saldo se muestre con formato de miles
    document.getElementById('saldo_disponible').value = Number(saldo).toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});
    actualizarNuevoSaldoOrigen();
});

document.getElementById('monto_origen_transferencia').addEventListener('input', actualizarNuevoSaldoOrigen);


// ===== DESTINO =====
function actualizarNuevoSaldoDestino() {
    const saldoStr = document.getElementById('saldo_disponible_destino').value || "0";
    const montoStr = document.getElementById('monto_origen_transferencia').value || "0"; // mismo monto de transferencia

    const saldo = parseFloat(limpiarNumero(saldoStr)) || 0;
    const monto = parseFloat(limpiarNumero(montoStr)) || 0;

    // En destino se SUMA el monto
    document.getElementById('nuevo_saldo_destino').value = saldo + monto;
}

document.getElementById('banco_destino').addEventListener('change', function() {
    const saldo = this.options[this.selectedIndex].getAttribute('data-saldo') || "0";
    document.getElementById('saldo_disponible_destino').value = Number(saldo).toLocaleString('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    actualizarNuevoSaldoDestino();
});

document.getElementById('monto_origen_transferencia').addEventListener('input', actualizarNuevoSaldoDestino);

});