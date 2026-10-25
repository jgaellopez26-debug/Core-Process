(function () {
  const botonMenu = document.getElementById("menu");
  const panelMenu = document.getElementById("menu-panel");

  if (!botonMenu || !panelMenu) {
    console.error("Menú: no encontré #menu o #menu-panel en el HTML");
    return;
  }

  function cerrarMenu() {
    panelMenu.hidden = true;
    botonMenu.setAttribute("aria-expanded", "false");
  }

  botonMenu.addEventListener("click", function (e) {
    e.stopPropagation();
    const abrir = panelMenu.hidden;
    panelMenu.hidden = !abrir;
    botonMenu.setAttribute("aria-expanded", String(abrir));
  });

  // Cierra al hacer clic afuera o con Escape
  document.addEventListener("click", function (e) {
    if (!panelMenu.hidden && !panelMenu.contains(e.target)) cerrarMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") cerrarMenu();
  });
})();
