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
    //Saldo inicial con separador de miles
    const saldoInput = document.getElementById("saldo_inicial");
    if (saldoInput) {
        // Formatear valor inicial al cargar (parseFloat maneja decimales de Python)
        var numInicial = parseFloat(saldoInput.value);
        if (!isNaN(numInicial)) {
            saldoInput.value = Math.round(numInicial).toLocaleString('es-CL');
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

    // Formatear opciones del selector de gastos
    var gastoSelect = document.getElementById('gastoSelect');
    if (gastoSelect) {
        gastoSelect.querySelectorAll('option[value]').forEach(function(opt) {
            if (!opt.value) return;
            var match = opt.textContent.match(/^(.*)\s-\s\$?([\d.,]+)$/);
            if (match) {
                var num = parseFloat(match[2]);
                if (!isNaN(num)) {
                    opt.textContent = match[1] + ' - $' + Math.round(num).toLocaleString('es-CL');
                }
            }
        });

        gastoSelect.addEventListener('change', function() {
            var id = this.value;
            if (id) window.location.href = '/mov/pago/' + id;
        });
    }

    // Formatear campos de monto al cargar
    ['montoPendiente', 'montoDetalle'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el && el.value) {
            var num = parseFloat(el.value);
            if (!isNaN(num)) {
                el.value = Math.round(num).toLocaleString('es-CL');
            }
        }
    });

    // Saldo actual del banco según selector
    var bancoSelect = document.getElementById('banco1');
    var saldoBanco = document.getElementById('saldoBanco');
    if (bancoSelect && saldoBanco) {
        function updateSaldo() {
            var selected = bancoSelect.options[bancoSelect.selectedIndex];
            var raw = selected ? parseFloat(selected.getAttribute('data-saldo')) : NaN;
            saldoBanco.value = !isNaN(raw) ? Math.round(raw).toLocaleString('es-CL') : '';
        }
        bancoSelect.addEventListener('change', updateSaldo);
        updateSaldo();
    }


});