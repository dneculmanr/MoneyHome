document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

// Funcion Modal del boton editar de movimientos
document.getElementById("modalEditar").addEventListener("show.bs.modal", function (event) {
    const btn = event.relatedTarget;

    const id = btn.getAttribute("data-id");
    const descripcion = btn.getAttribute("data-descripcion");
    const monto = btn.getAttribute("data-monto");

    document.getElementById("edit_descripcion").value = descripcion || "";
    document.getElementById("edit_monto").value = monto || "";

    document.getElementById("formEditar").action = "/mov/editar/" + id;
    });

});
