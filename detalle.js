(function () {
  function $(id) {
    return document.getElementById(id);
  }

  var detalle = $("detalle");
  // lo saca de cualquier sección para que no se oculte con ella
document.querySelector("main").appendChild(detalle);
  var tarjetaActual = null;
  var origen = null;
  var cantidad = 1;

  function pintarCantidad() {
    $("detalle-num").textContent = cantidad;
  }

  function arriba() {
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function abrir(tarjeta) {
    tarjetaActual = tarjeta;
    cantidad = 1;
    pintarCantidad();

    var foto = tarjeta.querySelector(".producto__foto img");
    var nombre = tarjeta.querySelector("h3").textContent.trim();
    var p = tarjeta.querySelector("p");
    var presentacion = p ? p.textContent.trim() : "";

    $("detalle-img").src = foto.getAttribute("src");
    $("detalle-img").alt = nombre;
    $("detalle-nombre").textContent = nombre;
    $("detalle-precio").textContent = tarjeta.querySelector(".producto__precio").textContent.trim();
    $("detalle-car-nombre").textContent = nombre;
    $("detalle-car-pres").textContent = presentacion;

    // guarda de qué sección venía y la oculta
    origen = document.querySelector(".seccion.visible");
    document.querySelectorAll(".seccion").forEach(function (s) {
      s.classList.remove("visible");
    });
    document.body.classList.add("en-seccion");

    detalle.hidden = false;
    arriba();
  }

  function volver() {
    detalle.hidden = true;
    (origen || $("suplementos")).classList.add("visible");
    arriba();
  }

  // reutiliza el botón "Agregar" de la tarjeta para no duplicar la lógica del carrito
  function agregar(n) {
    var boton = tarjetaActual.querySelector(".producto__btn");
    for (var i = 0; i < n; i++) boton.click();
  }

  // las tarjetas con foto (las proteínas) se vuelven clicables
  document.querySelectorAll(".producto").forEach(function (t) {
    if (!t.querySelector(".producto__foto img")) return;
    t.classList.add("producto--abre");
    t.tabIndex = 0;
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".producto__btn")) return; // "Agregar" sigue igual
    var tarjeta = e.target.closest(".producto--abre");
    if (tarjeta) abrir(tarjeta);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.classList.contains("producto--abre")) {
      abrir(e.target);
    }
  });

  $("detalle-volver").addEventListener("click", volver);

  $("detalle-mas").addEventListener("click", function () {
    cantidad += 1;
    pintarCantidad();
  });

  $("detalle-menos").addEventListener("click", function () {
    if (cantidad > 1) cantidad -= 1;
    pintarCantidad();
  });

  $("detalle-agregar").addEventListener("click", function () {
    agregar(cantidad);
  });

  $("detalle-comprar").addEventListener("click", function () {
    agregar(cantidad);
    if (window.CoreCarrito) window.CoreCarrito.abrir();
  });
})();