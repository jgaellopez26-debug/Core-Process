(function () {
  var secciones = document.querySelectorAll(".seccion");
  var botones = document.querySelectorAll('a[href="#suplementos"], a[href="#accesorios"]');

  function irArriba() {
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function mostrarSeccion(destino) {
    secciones.forEach(function (s) {
      s.classList.toggle("visible", s === destino);
    });
    document.body.classList.add("en-seccion");
    irArriba();
  }

  function mostrarInicio() {
    secciones.forEach(function (s) {
      s.classList.remove("visible");
    });
    document.body.classList.remove("en-seccion");
    irArriba();
  }

  // botón "Volver al inicio" dentro de cada sección
  secciones.forEach(function (s) {
    var volver = document.createElement("button");
    volver.type = "button";
    volver.className = "volver";
    volver.textContent = "← Volver al inicio";
    volver.addEventListener("click", mostrarInicio);
    s.insertBefore(volver, s.firstChild);
  });

  // botones Suplementos y Accesorios del inicio
  botones.forEach(function (boton) {
    boton.addEventListener("click", function (e) {
      e.preventDefault();
      var destino = document.querySelector(boton.getAttribute("href"));
      if (destino) mostrarSeccion(destino);
    });
  });
})();