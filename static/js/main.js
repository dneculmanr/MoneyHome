document.addEventListener("DOMContentLoaded", function () {

// =========================
// MENÚ HAMBURGUESA
// =========================
const toggleBtn = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const overlay = document.querySelector(".overlay");

if (toggleBtn && navMenu && overlay) {

    
toggleBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("menu-open"); // 👈 ESTE
});

    // cerrar al hacer click fuera
overlay.addEventListener("click", () => {
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("menu-open"); // 👈 ESTE
});
}

// =========================
// PORTAL ADMIN
// =========================
//--------------usuarios----------------
    if (document.getElementById('editarUsuarioModal')) {
        document.getElementById('editarUsuarioModal').addEventListener('show.bs.modal', function (e) {
            const btn = e.relatedTarget;
            document.getElementById('edit_user_id').value = btn.dataset.id;
            document.getElementById('edit_nombre').value   = btn.dataset.nombre;
            document.getElementById('edit_email').value    = btn.dataset.email;
            document.getElementById('edit_rol_id').value   = btn.dataset.rol;
        });
    }

    if (document.getElementById('eliminarUsuarioModal')) {
        document.getElementById('eliminarUsuarioModal').addEventListener('show.bs.modal', function (e) {
            const btn = e.relatedTarget;
            document.getElementById('eliminar_nombre').textContent = btn.dataset.nombre;
            document.getElementById('eliminarForm').action = '/admin/usuarios/' + btn.dataset.id + '/eliminar';
        });
    }

//--------------roles----------------
    if (document.getElementById('verRolModal')) {
        document.getElementById('verRolModal').addEventListener('show.bs.modal', function (e) {
            const btn = e.relatedTarget;
            document.getElementById('ver_id').textContent          = btn.dataset.id;
            document.getElementById('ver_nombre').textContent      = btn.dataset.nombre;
            document.getElementById('ver_descripcion').textContent = btn.dataset.descripcion;
        });
    }

//--------------AUTOAYUDA----------------

    function actualizarCamposCrear(tipo) {
        document.getElementById('crear_adjunto_div').style.display = (tipo === 'pdf' || tipo === 'word') ? 'block' : 'none';
        document.getElementById('crear_url_div').style.display     = tipo === 'video' ? 'block' : 'none';
        const accept = tipo === 'pdf' ? '.pdf' : (tipo === 'word' ? '.doc,.docx' : '');
        document.getElementById('crear_adjunto_input').accept = accept;
    }

    function actualizarCamposEditar(tipo) {
        document.getElementById('edit_adjunto_div').style.display = (tipo === 'pdf' || tipo === 'word') ? 'block' : 'none';
        document.getElementById('edit_url_div').style.display     = tipo === 'video' ? 'block' : 'none';
        const accept = tipo === 'pdf' ? '.pdf' : (tipo === 'word' ? '.doc,.docx' : '');
        document.getElementById('edit_adjunto_input').accept = accept;
    }

    if (document.getElementById('crear_tipo')) {
        document.getElementById('crear_tipo').addEventListener('change', function () {
            actualizarCamposCrear(this.value);
        });
    }

    if (document.getElementById('editarRecursoModal')) {
        document.getElementById('editarRecursoModal').addEventListener('show.bs.modal', function (e) {
            const btn = e.relatedTarget;
            document.getElementById('edit_id').value        = btn.dataset.id;
            document.getElementById('edit_titulo').value    = btn.dataset.titulo;
            document.getElementById('edit_contenido').value = btn.dataset.contenido;
            document.getElementById('edit_tipo').value      = btn.dataset.tipo;
            document.getElementById('edit_url').value       = btn.dataset.url;
            document.getElementById('edit_modulo').value    = btn.dataset.modulo;
            document.getElementById('edit_rol_id').value    = btn.dataset.rol;
            document.getElementById('edit_adjunto_actual').textContent = btn.dataset.url ? 'Actual: ' + btn.dataset.url : '';
            actualizarCamposEditar(btn.dataset.tipo);
        });
        document.getElementById('edit_tipo').addEventListener('change', function () {
            actualizarCamposEditar(this.value);
        });
    }

    if (document.getElementById('eliminarRecursoModal')) {
        document.getElementById('eliminarRecursoModal').addEventListener('show.bs.modal', function (e) {
            const btn = e.relatedTarget;
            document.getElementById('eliminar_titulo').textContent = btn.dataset.titulo;
            document.getElementById('eliminarRecursoForm').action = '/admin/autoayuda/' + btn.dataset.id + '/eliminar';
        });
    }


// =========================
// TICKET DETALLE
// =========================
    const hilo = document.getElementById('hilo-conversacion');
    if (hilo) hilo.scrollTop = hilo.scrollHeight;

// =========================
// TICKETS
// =========================
    if (document.getElementById('responderTicketModal')) {
        document.getElementById('responderTicketModal').addEventListener('show.bs.modal', function (e) {
            const btn  = e.relatedTarget;
            const id   = btn.dataset.id;
            const form = document.getElementById('responderTicketForm');

            form.action = window.location.pathname.startsWith('/admin')
                ? '/admin/tickets/' + id + '/responder'
                : '/tickets/' + id + '/responder';

            // Admin: poblar datos del ticket
            if (document.getElementById('modal_usuario')) {
                document.getElementById('modal_usuario').textContent     = btn.dataset.usuario || '';
                document.getElementById('modal_asunto').textContent      = btn.dataset.asunto || '';
                document.getElementById('modal_descripcion').textContent = btn.dataset.descripcion || '';
            }

            // Usuario: mostrar respuesta del admin si existe
            const respuestaDiv   = document.getElementById('respuesta_admin_div');
            const respuestaTexto = document.getElementById('respuesta_admin_texto');
            if (respuestaDiv && respuestaTexto) {
                const respuesta = btn.dataset.respuesta || '';
                if (respuesta) {
                    respuestaTexto.textContent = respuesta;
                    respuestaDiv.style.display = 'block';

                    // Marcar como leído si aún no lo estaba
                    if (btn.dataset.leido === '0') {
                        fetch('/tickets/' + id + '/leer', { method: 'POST' });
                        // Quitar negrita de la fila inmediatamente
                        btn.closest('tr').classList.remove('fw-bold');
                        btn.dataset.leido = '1';
                    }
                } else {
                    respuestaDiv.style.display = 'none';
                }
            }
        });
    }

// =========================
// AUTOAYUDA USUARIO
// =========================
    if (document.querySelector('.btn-filtro')) {
        document.querySelectorAll('.btn-filtro').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active', 'btn-dark'));
                this.classList.add('active', 'btn-dark');
                const tipo = this.dataset.tipo;
                document.querySelectorAll('.recurso-card').forEach(card => {
                    card.style.display = (tipo === 'todos' || card.dataset.tipo === tipo) ? 'block' : 'none';
                });
            });
        });
    }

    if (document.getElementById('verRecursoModal')) {
        document.getElementById('verRecursoModal').addEventListener('show.bs.modal', function (e) {
            const btn       = e.relatedTarget;
            const tipo      = btn.dataset.tipo;
            const titulo    = btn.dataset.titulo;
            const contenido = btn.dataset.contenido || '';
            const url       = btn.dataset.url || '';

            document.getElementById('modal_titulo').textContent = titulo;

            let cuerpo = '';
            if (tipo === 'texto') {
                cuerpo = `<p>${contenido.replace(/\n/g, '<br>')}</p>`;
            } else if (tipo === 'pdf') {
                cuerpo = `<iframe src="${url}" width="100%" height="500px" style="border:none;"></iframe>`;
            } else if (tipo === 'video') {
                const embedUrl = url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
                cuerpo = `<div class="ratio ratio-16x9"><iframe src="${embedUrl}" allowfullscreen></iframe></div>`;
            }
            document.getElementById('modal_cuerpo').innerHTML = cuerpo;
        });

        document.getElementById('verRecursoModal').addEventListener('hidden.bs.modal', function () {
            document.getElementById('modal_cuerpo').innerHTML = '';
        });
    }




// =========================
// ADMIN GRAFICOS
// =========================
    if (document.getElementById('admin-data')) {
        const _a     = JSON.parse(document.getElementById('admin-data').textContent);
        const colores = ['#0d6efd','#dc3545','#fd7e14','#6f42c1','#20c997','#ffc107','#0dcaf0','#198754'];

        if (document.getElementById('adminGraficoDona')) {
            new Chart(document.getElementById('adminGraficoDona'), {
                type: 'doughnut',
                data: {
                    labels: _a.usuarios_por_rol.map(r => r.nombre),
                    datasets: [{ data: _a.usuarios_por_rol.map(r => r.total), backgroundColor: colores, borderWidth: 0 }]
                },
                options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        }

        if (document.getElementById('adminGraficoBarras')) {
            new Chart(document.getElementById('adminGraficoBarras'), {
                type: 'bar',
                data: {
                    labels: _a.bancos_uso.map(b => b.nombre),
                    datasets: [{ label: 'Usuarios', data: _a.bancos_uso.map(b => b.total), backgroundColor: '#0d6efd' }]
                },
                options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            });
        }

        if (document.getElementById('adminGraficoManuales')) {
            new Chart(document.getElementById('adminGraficoManuales'), {
                type: 'doughnut',
                data: {
                    labels: _a.manuales_tipo.map(m => m.tipo),
                    datasets: [{ data: _a.manuales_tipo.map(m => m.total), backgroundColor: colores, borderWidth: 0 }]
                },
                options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        }
    }

// =========================
// DASHBOARD GRAFICOS
// =========================
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) alert.remove();
    }, 3000);

    if (document.getElementById('dashboard-data')) {
        const _d = JSON.parse(document.getElementById('dashboard-data').textContent);
        const mensual = _d.mensual.reverse();
        const colores = ['#0d6efd','#dc3545','#fd7e14','#6f42c1','#20c997','#ffc107','#0dcaf0','#198754'];

        if (document.getElementById('graficoDona')) {
            new Chart(document.getElementById('graficoDona'), {
                type: 'doughnut',
                data: {
                    labels: _d.categorias.map(c => c.categoria),
                    datasets: [{ data: _d.categorias.map(c => c.total), backgroundColor: colores, borderWidth: 0 }]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }
                }
            });
        }

        if (document.getElementById('graficoBarras')) {
            new Chart(document.getElementById('graficoBarras'), {
                type: 'bar',
                data: {
                    labels: mensual.map(m => m.mes),
                    datasets: [
                        { label: 'Ingresos', data: mensual.map(m => m.ingresos), backgroundColor: '#198754' },
                        { label: 'Gastos',   data: mensual.map(m => m.gastos),   backgroundColor: '#dc3545' }
                    ]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
                    scales: { y: { beginAtZero: true, ticks: { font: { size: 11 } } } }
                }
            });
        }
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
// CREAR MOVIMIENTO 
// =========================
//Fecha por defecto: hoy (pero editable).
    const fechaInput = document.getElementById("fecha_movimiento");
    if (fechaInput) {
        const hoy = new Date().toISOString().split('T')[0];
        if (!fechaInput.value) fechaInput.value = hoy;
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

        nuevoEl.value = Math.round(saldo - monto).toLocaleString('es-CL');
    }

    function actualizarNuevoSaldoDestino() {
        const saldoEl = document.getElementById('saldo_disponible_destino');
        const nuevoEl = document.getElementById('nuevo_saldo_destino');

        if (!saldoEl || !nuevoEl || !montoInput) return;

        const saldo = parseFloat(limpiarNumero(saldoEl.value || "0")) || 0;
        const monto = parseFloat(limpiarNumero(montoInput.value || "0")) || 0;

        nuevoEl.value = Math.round(saldo + monto).toLocaleString('es-CL');
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

    // Monto en formulario editar movimiento
    const montoEditar = document.getElementById('monto_editar');
    if (montoEditar) {
        montoEditar.addEventListener('input', function () {
            let raw = this.value.replace(/[\.,]/g, '');
            if (!isNaN(raw) && raw !== '') {
                this.value = Number(raw).toLocaleString('es-CL');
            }
        });
    }

    // Al cargar en modo edición, formatear monto e inicializar saldos
    if (montoInput && montoInput.value) {
        const raw = parseFloat(montoInput.value);
        if (!isNaN(raw)) montoInput.value = Math.round(raw).toLocaleString('es-CL');
    }
    if (bancoOrigen && bancoOrigen.value) {
        bancoOrigen.dispatchEvent(new Event('change'));
    }
    if (bancoDestino && bancoDestino.value) {
        bancoDestino.dispatchEvent(new Event('change'));
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