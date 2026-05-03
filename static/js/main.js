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
    // BANCO
    // =========================
    //Saldo iniciaal con separador de miles
    const saldoInput = document.getElementById("saldo_inicial");
    if (saldoInput) {
        // Formatear valor inicial al cargar
        let raw = saldoInput.value.replace(/[\.,]/g, '');
        if (!isNaN(raw) && raw !== "") {
            saldoInput.value = Number(raw).toLocaleString('es-CL');
        }
        saldoInput.addEventListener("input", function () {
            let value = this.value.replace(/[\.,]/g, '');
            if (!isNaN(value) && value !== "") {
                this.value = Number(value).toLocaleString('es-CL');
            }
        });
    }


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
    // TRANSFERENCIA 
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

    // =========================
    // PAGO
    // =========================

    // Actualizar saldo mostrado al cambiar banco
    document.addEventListener('DOMContentLoaded', function() {
        var bancoSelect = document.getElementById('banco1');
        var saldoBanco = document.getElementById('saldoBanco');
        function updateSaldo() {
            var selected = bancoSelect.options[bancoSelect.selectedIndex];
            saldoBanco.value = selected ? selected.getAttribute('data-saldo') : '';
            }
            bancoSelect.addEventListener('change', updateSaldo);
            updateSaldo();
    });

    document.getElementById('gastoSelect').addEventListener('change', function() {
        var id = this.value;
        if (id) {
            window.location.href = '/mov/pago/' + id;
        }
    }); 

    // Script para actualizar el saldo del banco al cambiar el selector
    document.addEventListener('DOMContentLoaded', function() {
        var bancoSelect = document.getElementById('banco1');
        var saldoInput = document.getElementById('saldoBanco');
            if (bancoSelect && saldoInput) {
                function updateSaldo() {
                    var selected = bancoSelect.options[bancoSelect.selectedIndex];
                    var saldo = selected.getAttribute('data-saldo');
                        saldoInput.value = saldo !== null ? saldo : '';
                        }
                bancoSelect.addEventListener('change', updateSaldo);
    // Inicializar al cargar
    updateSaldo();
    }
    });


});