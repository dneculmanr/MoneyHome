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

    // ===== TRANSFERENCIAS: SALDO DESTINO CALCULADO =====
    const montoTransferenciaOrigen = document.getElementById("monto_transferencia_origen");
    const ingresoDestinoSelect = document.getElementById("ingreso_destino_id");
    const saldoDestinoNuevo = document.getElementById("saldo_destino_nuevo");

    function calcularSaldoDestinoNuevo() {
        if (!montoTransferenciaOrigen || !ingresoDestinoSelect || !saldoDestinoNuevo) {
            return;
        }

        const montoTransferido = parseFloat(montoTransferenciaOrigen.value) || 0;
        const opcionSeleccionada = ingresoDestinoSelect.options[ingresoDestinoSelect.selectedIndex];
        const saldoActualDestino = opcionSeleccionada ? (parseFloat(opcionSeleccionada.dataset.monto) || 0) : 0;
        const saldoActualizado = saldoActualDestino + montoTransferido;

        saldoDestinoNuevo.textContent = "$" + saldoActualizado.toFixed(2);
    }

    if (montoTransferenciaOrigen && ingresoDestinoSelect && saldoDestinoNuevo) {
        montoTransferenciaOrigen.addEventListener("input", calcularSaldoDestinoNuevo);
        ingresoDestinoSelect.addEventListener("change", calcularSaldoDestinoNuevo);
        calcularSaldoDestinoNuevo();
    }

});