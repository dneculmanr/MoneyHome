document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // MENÚ HAMBURGUESA
    // =========================
    const toggleBtn = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener("click", function () {
            navMenu.classList.toggle("active");
        });
    }

    // =========================
    // VALIDACIÓN FORM (SUBMIT)
    // =========================
    const forms = document.querySelectorAll("form");

    forms.forEach(form => {
        form.addEventListener("submit", function (e) {
            let valid = true;
            const inputs = form.querySelectorAll("input, select");

            inputs.forEach(input => {
                if (input.hasAttribute("required") && !input.value.trim()) {
                    valid = false;
                    input.classList.add("is-invalid");
                } else {
                    input.classList.remove("is-invalid");
                }
            });

            if (!valid) {
                e.preventDefault();

                alert("Completa todos los campos obligatorios");
            }
        });
    });

    // =========================
    // VALIDACIÓN EN TIEMPO REAL
    // =========================
    const inputsRealtime = document.querySelectorAll("input[required], select[required]");

    inputsRealtime.forEach(input => {
        input.addEventListener("input", () => {
            if (!input.value.trim()) {
                input.classList.add("is-invalid");
                input.classList.remove("is-valid");
            } else {
                input.classList.remove("is-invalid");
                input.classList.add("is-valid");
            }
        });
    });

    // =========================
    // MODAL EDITAR CATEGORIA
    // =========================
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

    // =========================
    // TRANSFERENCIA (SAFE)
    // =========================
    function limpiarNumero(valor) {
        return valor.replace(/[\.,]/g, '');
    }

    const bancoOrigen = document.getElementById('banco_origen');
    const bancoDestino = document.getElementById('banco_destino');
    const montoInput = document.getElementById('monto_origen_transferencia');

    function actualizarNuevoSaldoOrigen() {
        const saldoEl = document.getElementById('saldo_disponible');
        const nuevoEl = document.getElementById('nuevo_saldo');

        if (!saldoEl || !nuevoEl || !montoInput) return;

        const saldo = parseFloat(limpiarNumero(saldoEl.value || "0")) || 0;
        const monto = parseFloat(limpiarNumero(montoInput.value || "0")) || 0;

        nuevoEl.value = saldo - monto;
    }

    function actualizarNuevoSaldoDestino() {
        const saldoEl = document.getElementById('saldo_disponible_destino');
        const nuevoEl = document.getElementById('nuevo_saldo_destino');

        if (!saldoEl || !nuevoEl || !montoInput) return;

        const saldo = parseFloat(limpiarNumero(saldoEl.value || "0")) || 0;
        const monto = parseFloat(limpiarNumero(montoInput.value || "0")) || 0;

        nuevoEl.value = saldo + monto;
    }

    if (bancoOrigen) {
        bancoOrigen.addEventListener('change', function () {
            const saldo = this.options[this.selectedIndex].getAttribute('data-saldo') || 0;

            const saldoEl = document.getElementById('saldo_disponible');
            if (saldoEl) {
                saldoEl.value = Number(saldo).toLocaleString('es-CL');
            }

            actualizarNuevoSaldoOrigen();
        });
    }

    if (bancoDestino) {
        bancoDestino.addEventListener('change', function () {
            const saldo = this.options[this.selectedIndex].getAttribute('data-saldo') || 0;

            const saldoEl = document.getElementById('saldo_disponible_destino');
            if (saldoEl) {
                saldoEl.value = Number(saldo).toLocaleString('es-CL');
            }

            actualizarNuevoSaldoDestino();
        });
    }

    if (montoInput) {
        montoInput.addEventListener('input', () => {
            actualizarNuevoSaldoOrigen();
            actualizarNuevoSaldoDestino();
        });
    }

});