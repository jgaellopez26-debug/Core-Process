document.addEventListener("click", function (e) {
  var boton = e.target.closest(".tamano");
  if (!boton) return;

  var destino = document.getElementById(boton.dataset.destino);
  if (!destino) return;

  // muestra solo la sección del tamaño elegido
  document.querySelectorAll(".seccion").forEach(function (s) {
    s.classList.toggle("visible", s === destino);
  });
  window.scrollTo({ top: 0, behavior: "instant" });
});