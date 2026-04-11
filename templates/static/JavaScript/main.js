document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

// Funcion Modal del boton editar de movimientos
const modalEditar = document.getElementById("modalEditar");
if (!modalEditar) return;

modalEditar.addEventListener("show.bs.modal", function (event) {
    const btn = event.relatedTarget;
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const descripcion = btn.getAttribute("data-descripcion");
    const categoriaId = btn.getAttribute("data-categoria-id");
    const categoriaNombre = btn.getAttribute("data-categoria-nombre");
    const monto = btn.getAttribute("data-monto");

    document.getElementById("edit_descripcion").value = descripcion || "";
    document.getElementById("edit_monto").value = monto || "";
    document.getElementById("edit_categoria_id").value = categoriaId || "";
    document.getElementById("edit_categoria_name").textContent = categoriaNombre || "Seleccionar categoria";

    document.getElementById("formEditar").action = "/mov/editar/" + id;
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

});
