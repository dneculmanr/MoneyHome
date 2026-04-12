document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  const modalEditar = document.getElementById("modalEditar");
  const modalEliminar = document.getElementById("modalEliminar");
  const formEditar = document.getElementById("formEditar");
  const formEliminar = document.getElementById("formEliminar");

  let movimientoIdSeleccionado = null;

  if (modalEditar) {
    modalEditar.addEventListener("show.bs.modal", (event) => {
      const btn = event.relatedTarget;
      if (!btn) return;

      const id = btn.getAttribute("data-id");
      const descripcion = btn.getAttribute("data-descripcion");
      const categoriaId = btn.getAttribute("data-categoria-id");
      const categoriaNombre = btn.getAttribute("data-categoria-nombre");
      const monto = btn.getAttribute("data-monto");

      movimientoIdSeleccionado = id;

      document.getElementById("edit_descripcion").value = descripcion || "";
      document.getElementById("edit_monto").value = monto || "";
      document.getElementById("edit_categoria_id").value = categoriaId || "";
      document.getElementById("edit_categoria_name").textContent = categoriaNombre || "Seleccionar categoria";

      if (formEditar && id) {
        formEditar.action = "/mov/editar/" + id;
      }
    });

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

  if (modalEliminar) {
    modalEliminar.addEventListener("show.bs.modal", () => {
      if (formEliminar && movimientoIdSeleccionado) {
        formEliminar.action = "/mov/eliminar/" + movimientoIdSeleccionado;
      }
    });
  }
});
