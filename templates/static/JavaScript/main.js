// Funcionalidad del menú de navegación.
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
// Funcionalidad dispositivos móviles.
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }
// Funcionalidad para los modales de editar y eliminar movimientos.
  const modalEditar = document.getElementById("modalEditar");
  const modalEliminar = document.getElementById("modalEliminar");
  const formEditar = document.getElementById("formEditar");
  const formEliminar = document.getElementById("formEliminar");

  let movimientoIdSeleccionado = null;
  // modal de editar movimiento.
  if (modalEditar) {
    modalEditar.addEventListener("show.bs.modal", (event) => {
      const btn = event.relatedTarget;
      if (!btn) return;
      // Obtener los datos del movimiento del botón modal.
      const id = btn.getAttribute("data-id");
      const descripcion = btn.getAttribute("data-descripcion");
      const categoriaId = btn.getAttribute("data-categoria-id");
      const categoriaNombre = btn.getAttribute("data-categoria-nombre");
      const monto = btn.getAttribute("data-monto");

      movimientoIdSeleccionado = id;
      // Rellenar los campos del formulario con los datos del movimiento.
      document.getElementById("edit_descripcion").value = descripcion || "";
      document.getElementById("edit_monto").value = monto || "";
      document.getElementById("edit_categoria_id").value = categoriaId || "";
      document.getElementById("edit_categoria_name").textContent = categoriaNombre || "Seleccionar categoria";
      if (formEditar && id) {
        formEditar.action = "/mov/editar/" + id;
      }
    });
    // Configuración del menú desplegable de categorías dentro del modal de editar.
    const categoriaItems = document.querySelectorAll("#edit_categoria_list .dropdown-item");
    categoriaItems.forEach((item) => {
      item.addEventListener("click", () => {
        const categoriaId = item.getAttribute("data-categoria-id");
        const categoriaNombre = item.getAttribute("data-categoria-nombre");
        document.getElementById("edit_categoria_id").value = categoriaId || "";
        document.getElementById("edit_categoria_name").textContent = categoriaNombre || "Seleccionar categoria";
      });
    });
  }
  // modal de eliminar movimiento.
  if (modalEliminar) {
    modalEliminar.addEventListener("show.bs.modal", () => {
      if (formEliminar && movimientoIdSeleccionado) {
        formEliminar.action = "/mov/eliminar/" + movimientoIdSeleccionado;
      }
    });
  }
  // Funcionalidad para los modales de editar y eliminar categorías.
  const modalEditarCategoria = document.getElementById("modalEditarCategoria");
  const formEditarCategoria = document.getElementById("formEditarCategoria");
  const modalEliminarCategoria = document.getElementById("modalEliminarCategoria");
  const formEliminarCategoria = document.getElementById("formEliminarCategoria");
  let categoriaIdSeleccionada = null;
  // modal de editar para categorías.
  if (modalEditarCategoria) {
    modalEditarCategoria.addEventListener("show.bs.modal", (event) => {
      const btn = event.relatedTarget;
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      const nombre = btn.getAttribute("data-nombre");
      categoriaIdSeleccionada = id;
      document.getElementById("edit_categoria_id").value = id || "";
      document.getElementById("edit_categoria_nombre").value = nombre || "";
      if (formEditarCategoria && id) {
        formEditarCategoria.action = "/categorias/editar/" + id;
      }
    });
  }
  // modal de eliminar para categorías.
  if (modalEliminarCategoria) {
    modalEliminarCategoria.addEventListener("show.bs.modal", () => {
      if (formEliminarCategoria && categoriaIdSeleccionada) {
        formEliminarCategoria.action = "/categorias/eliminar/" + categoriaIdSeleccionada;
      }
    });
  }
});
