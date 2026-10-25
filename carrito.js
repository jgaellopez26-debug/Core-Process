(function () {
  var CLAVE = "core-process-carrito";
  var usuario = null; // correo de la cuenta con sesión (null = sin sesión)
  var items = [];

  var menuBoton = document.getElementById("menu");
  var menuPanel = document.getElementById("menu-panel");
  var abrir = document.getElementById("abrir-carrito");
  var cerrar = document.getElementById("cerrar-carrito");
  var vaciar = document.getElementById("vaciar-carrito");
  var panel = document.getElementById("carrito");
  var fondo = document.getElementById("carrito-fondo");
  var lista = document.getElementById("carrito-lista");
  var vacio = document.getElementById("carrito-vacio");
  var totalEl = document.getElementById("carrito-total");
  var contadorMenu = document.getElementById("contador-menu");
  var badge = document.getElementById("badge-carrito");
  var aviso = document.getElementById("aviso");
  var temporizador;

  function dinero(n) {
    return "$" + n.toLocaleString("es-MX") + " MXN";
  }

  /* ----- Carrito guardado POR CUENTA ----- */
  function leer() {
    if (!usuario) return []; // sin sesión = carrito en cero
    try {
      return JSON.parse(localStorage.getItem(CLAVE + "_" + usuario)) || [];
    } catch (e) {
      return [];
    }
  }

  function guardar() {
    if (!usuario) return;
    try {
      localStorage.setItem(CLAVE + "_" + usuario, JSON.stringify(items));
    } catch (e) {}
  }

  /* ----- Notificación ----- */
  function mostrarAviso(mensaje) {
    aviso.textContent = mensaje;
    aviso.classList.add("visible");
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
      aviso.classList.remove("visible");
    }, 2500);
  }

  /* ----- Abrir y cerrar el carrito ----- */
  function abrirCarrito() {
    // cierra el menú de tres puntitos
    if (menuPanel) menuPanel.hidden = true;
    if (menuBoton) menuBoton.setAttribute("aria-expanded", "false");

    panel.classList.add("abierto");
    fondo.classList.add("abierto");
    panel.setAttribute("aria-hidden", "false");
  }

  function cerrarCarrito() {
    panel.classList.remove("abierto");
    fondo.classList.remove("abierto");
    panel.setAttribute("aria-hidden", "true");
  }

  /* ----- Dibujar el carrito ----- */
  function dibujar() {
    lista.innerHTML = "";
    var total = 0;
    var cantidadTotal = 0;

    items.forEach(function (item, i) {
      total += item.precio * item.cantidad;
      cantidadTotal += item.cantidad;

      var li = document.createElement("li");
      li.className = "carrito__item";

      if (item.imagen) {
        var foto = document.createElement("img");
        foto.className = "carrito__foto";
        foto.src = item.imagen;
        foto.alt = item.nombre;
        li.appendChild(foto);
      } else {
        li.appendChild(document.createElement("span"));
      }

      var info = document.createElement("div");
      info.className = "carrito__info";
      var nombre = document.createElement("span");
      nombre.className = "carrito__nombre";
      nombre.textContent = item.nombre;
      var precio = document.createElement("span");
      precio.className = "carrito__precio";
      precio.textContent = dinero(item.precio);
      info.appendChild(nombre);
      info.appendChild(precio);
      li.appendChild(info);

      var cantidad = document.createElement("div");
      cantidad.className = "carrito__cantidad";
      var menos = document.createElement("button");
      menos.type = "button";
      menos.textContent = "−";
      menos.setAttribute("aria-label", "Quitar uno");
      menos.dataset.accion = "menos";
      menos.dataset.indice = i;
      var num = document.createElement("span");
      num.textContent = item.cantidad;
      var mas = document.createElement("button");
      mas.type = "button";
      mas.textContent = "+";
      mas.setAttribute("aria-label", "Agregar uno");
      mas.dataset.accion = "mas";
      mas.dataset.indice = i;
      cantidad.appendChild(menos);
      cantidad.appendChild(num);
      cantidad.appendChild(mas);
      li.appendChild(cantidad);

      lista.appendChild(li);
    });

    totalEl.textContent = dinero(total);
    vacio.hidden = items.length > 0;
    vaciar.hidden = items.length === 0;
    contadorMenu.textContent = cantidadTotal;
    badge.textContent = cantidadTotal;
    badge.hidden = cantidadTotal === 0;
  }

  /* ----- Agregar un producto ----- */
  function agregar(tarjeta) {
    var nombre = tarjeta.querySelector("h3").textContent.trim();
    var precioTexto = tarjeta.querySelector(".producto__precio").textContent;
    var precio = parseFloat(precioTexto.replace(/[^0-9.]/g, "")) || 0;
    var img = tarjeta.querySelector(".producto__foto img");
    var imagen = img ? img.getAttribute("src") : "";

    var existente = items.find(function (it) {
      return it.nombre === nombre;
    });

    if (existente) {
      existente.cantidad += 1;
    } else {
      items.push({ nombre: nombre, precio: precio, cantidad: 1, imagen: imagen });
    }

    guardar();
    dibujar();
    mostrarAviso(nombre + " se agregó a tu carrito");
  }

  /* ----- Eventos ----- */
  document.addEventListener("click", function (e) {
    var boton = e.target.closest(".producto__btn");
    if (boton) {
      agregar(boton.closest(".producto"));
    }
  });

  lista.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var i = Number(b.dataset.indice);

    if (b.dataset.accion === "mas") {
      items[i].cantidad += 1;
    } else if (b.dataset.accion === "menos") {
      items[i].cantidad -= 1;
      if (items[i].cantidad <= 0) items.splice(i, 1);
    }

    guardar();
    dibujar();
  });

  vaciar.addEventListener("click", function () {
    items = [];
    guardar();
    dibujar();
    mostrarAviso("Carrito vacío");
  });

  abrir.addEventListener("click", abrirCarrito);
  cerrar.addEventListener("click", cerrarCarrito);
  fondo.addEventListener("click", cerrarCarrito);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") cerrarCarrito();
  });

  /* ----- Funciones que usa cuenta.js (inicio de sesión) ----- */
  window.CoreCarrito = {
    obtener: function () {
      return items.map(function (it) {
        return { nombre: it.nombre, precio: it.precio, cantidad: it.cantidad };
      });
    },
    vaciar: function () {
      items = [];
      guardar();
      dibujar();
    },
    // Cambia de cuenta: carga el carrito de esa cuenta (o lo deja en cero si es null)
    cambiarUsuario: function (nuevo) {
      var invitado = usuario ? [] : items; // lo agregado antes de iniciar sesión
      usuario = nuevo || null;
      items = leer();
      invitado.forEach(function (nuevoItem) {
        var existente = items.find(function (it) {
          return it.nombre === nuevoItem.nombre;
        });
        if (existente) existente.cantidad += nuevoItem.cantidad;
        else items.push(nuevoItem);
      });
      guardar();
      dibujar();
    },
    abrir: abrirCarrito,
    cerrar: cerrarCarrito,
    aviso: mostrarAviso
  };

  dibujar();
})();
