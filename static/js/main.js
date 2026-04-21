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



});