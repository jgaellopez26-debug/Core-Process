/*
  CUENTAS Y COMPRAS (versión simulada con localStorage)
  - Las cuentas y las compras se guardan SOLO en este navegador.
  - Las contraseñas se guardan encriptadas (hash), nunca como texto normal.
  - Para una tienda real hace falta un backend (Firebase, Supabase, etc.).
*/
(function () {
  var CLAVE_USUARIOS = "core-process-usuarios";
  var CLAVE_SESION = "core-process-sesion";

  var siguiente = null; // qué abrir después de iniciar sesión: "carrito" | "compras" | null

  /* ===== Elementos ===== */
  function $(id) {
    return document.getElementById(id);
  }

  var menuBoton = $("menu");
  var menuPanel = $("menu-panel");
  var modal = $("modal");
  var vistas = {
    auth: $("vista-auth"),
    cuenta: $("vista-cuenta"),
    compras: $("vista-compras")
  };
  var mensaje = $("auth-mensaje");
  var formEntrar = $("form-entrar");
  var formRegistro = $("form-registro");

  /* ===== localStorage ===== */
  function leer(clave, defecto) {
    try {
      var valor = JSON.parse(localStorage.getItem(clave));
      return valor === null ? defecto : valor;
    } catch (e) {
      return defecto;
    }
  }

  function escribir(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch (e) {}
  }

  function leerUsuarios() {
    return leer(CLAVE_USUARIOS, []);
  }

  function usuarioActual() {
    var correo = leer(CLAVE_SESION, null);
    if (!correo) return null;
    return (
      leerUsuarios().find(function (u) {
        return u.correo === correo;
      }) || null
    );
  }

  function guardarUsuario(usuario) {
    var usuarios = leerUsuarios().map(function (u) {
      return u.correo === usuario.correo ? usuario : u;
    });
    escribir(CLAVE_USUARIOS, usuarios);
  }

  /* ===== Contraseña encriptada (SHA-256) ===== */
  function hashear(correo, clave) {
    var texto = correo + ":" + clave;

    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(texto))
        .then(function (buffer) {
          return Array.from(new Uint8Array(buffer))
            .map(function (b) {
              return b.toString(16).padStart(2, "0");
            })
            .join("");
        });
    }

    // Plan B por si el navegador no tiene crypto.subtle
    var h = 0;
    for (var i = 0; i < texto.length; i++) {
      h = (h * 31 + texto.charCodeAt(i)) | 0;
    }
    return Promise.resolve("simple-" + h);
  }

  /* ===== Utilidades ===== */
  function aviso(texto) {
    if (window.CoreCarrito) window.CoreCarrito.aviso(texto);
  }

  function dinero(n) {
    return "$" + n.toLocaleString("es-MX") + " MXN";
  }

  function crear(etiqueta, clase, texto) {
    var nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }

  function cerrarMenu() {
    if (menuPanel) menuPanel.hidden = true;
    if (menuBoton) menuBoton.setAttribute("aria-expanded", "false");
  }

  /* ===== Nombre en el menú de tres puntitos ===== */
  function actualizarMenu() {
    var usuario = usuarioActual();
    var nombreEl = $("menu-nombre");
    if (usuario) {
      nombreEl.textContent = usuario.nombre;
      nombreEl.hidden = false;
      menuPanel.classList.add("con-sesion");
    } else {
      nombreEl.textContent = "";
      nombreEl.hidden = true;
      menuPanel.classList.remove("con-sesion");
    }
  }

  /* ===== Abrir y cerrar la ventana ===== */
  function mostrarVista(nombre) {
    Object.keys(vistas).forEach(function (k) {
      vistas[k].hidden = k !== nombre;
    });
  }

  function abrirModal(vista) {
    cerrarMenu();
    mostrarVista(vista);
    modal.hidden = false;

    if (vista === "auth") {
      var campo = formEntrar.hidden ? $("registro-nombre") : $("entrar-correo");
      campo.focus();
    } else {
      $("cerrar-modal").focus();
    }
  }

  function cerrarModal() {
    modal.hidden = true;
    siguiente = null;
  }

  function ponerMensaje(texto, esError) {
    mensaje.textContent = texto || "";
    mensaje.classList.toggle("modal__mensaje--error", Boolean(esError));
  }

  function cambiarPestana(nombre) {
    var entrar = nombre === "entrar";
    formEntrar.hidden = !entrar;
    formRegistro.hidden = entrar;
    document.querySelectorAll(".pestana").forEach(function (p) {
      p.setAttribute("aria-selected", String(p.dataset.pestana === nombre));
    });
    ponerMensaje("");
  }

  function abrirAuth(textoInfo) {
    cambiarPestana("entrar");
    if (textoInfo) ponerMensaje(textoInfo);
    abrirModal("auth");
  }

  /* ===== Vista de cuenta ===== */
  function abrirCuenta() {
    var usuario = usuarioActual();
    if (!usuario) {
      abrirAuth();
      return;
    }
    $("cuenta-nombre").textContent = usuario.nombre;
    $("cuenta-correo").textContent = usuario.correo;
    abrirModal("cuenta");
  }

  /* ===== Vista de compras ===== */
  function abrirCompras() {
    var usuario = usuarioActual();
    if (!usuario) {
      siguiente = "compras";
      abrirAuth("Inicia sesión para ver tus compras.");
      return;
    }

    var lista = $("compras-lista");
    lista.innerHTML = "";
    var compras = usuario.compras || [];
    $("compras-vacio").hidden = compras.length > 0;

    // la más reciente primero
    compras
      .slice()
      .reverse()
      .forEach(function (compra) {
        var pedido = crear("article", "pedido");

        var cabecera = crear("div", "pedido__cabecera");
        cabecera.appendChild(crear("strong", null, "Pedido " + compra.id));
        var fecha = new Date(compra.fecha).toLocaleString("es-MX", {
          dateStyle: "medium",
          timeStyle: "short"
        });
        cabecera.appendChild(crear("span", "pedido__fecha", fecha));
        pedido.appendChild(cabecera);

        var productos = crear("ul", "pedido__lista");
        compra.items.forEach(function (item) {
          var li = crear("li");
          li.appendChild(crear("span", null, item.cantidad + " × " + item.nombre));
          li.appendChild(crear("span", null, dinero(item.precio * item.cantidad)));
          productos.appendChild(li);
        });
        pedido.appendChild(productos);

        var total = crear("p", "pedido__total");
        total.appendChild(crear("span", null, "Total"));
        total.appendChild(crear("strong", null, dinero(compra.total)));
        pedido.appendChild(total);

        lista.appendChild(pedido);
      });

    abrirModal("compras");
  }

  /* ===== Después de iniciar sesión ===== */
  function sesionIniciada(usuario, textoAviso) {
    escribir(CLAVE_SESION, usuario.correo);
    if (window.CoreCarrito) window.CoreCarrito.cambiarUsuario(usuario.correo);
    actualizarMenu();
    var destino = siguiente;
    cerrarModal();
    aviso(textoAviso);

    if (destino === "carrito" && window.CoreCarrito) {
      window.CoreCarrito.abrir();
    } else if (destino === "compras") {
      abrirCompras();
    }
  }

  /* ===== Crear cuenta ===== */
  formRegistro.addEventListener("submit", function (e) {
    e.preventDefault();

    var nombre = $("registro-nombre").value.trim();
    var correo = $("registro-correo").value.trim().toLowerCase();
    var clave = $("registro-clave").value;

    if (!nombre || !correo || !clave) {
      ponerMensaje("Llena todos los campos.", true);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      ponerMensaje("Escribe un correo válido.", true);
      return;
    }
    if (clave.length < 6) {
      ponerMensaje("La contraseña debe tener al menos 6 caracteres.", true);
      return;
    }

    var existe = leerUsuarios().some(function (u) {
      return u.correo === correo;
    });
    if (existe) {
      ponerMensaje("Ya existe una cuenta con ese correo.", true);
      return;
    }

    hashear(correo, clave).then(function (hash) {
      var usuario = { nombre: nombre, correo: correo, clave: hash, compras: [] };
      var usuarios = leerUsuarios();
      usuarios.push(usuario);
      escribir(CLAVE_USUARIOS, usuarios);
      formRegistro.reset();
      sesionIniciada(usuario, "¡Bienvenido, " + nombre + "!");
    });
  });

  /* ===== Iniciar sesión ===== */
  formEntrar.addEventListener("submit", function (e) {
    e.preventDefault();

    var correo = $("entrar-correo").value.trim().toLowerCase();
    var clave = $("entrar-clave").value;

    if (!correo || !clave) {
      ponerMensaje("Escribe tu correo y tu contraseña.", true);
      return;
    }

    hashear(correo, clave).then(function (hash) {
      var usuario = leerUsuarios().find(function (u) {
        return u.correo === correo && u.clave === hash;
      });

      if (!usuario) {
        ponerMensaje("Correo o contraseña incorrectos.", true);
        return;
      }

      formEntrar.reset();
      sesionIniciada(usuario, "Hola de nuevo, " + usuario.nombre);
    });
  });

  /* ===== Finalizar compra ===== */
  $("finalizar-compra").addEventListener("click", function () {
    if (!window.CoreCarrito) return;

    var items = window.CoreCarrito.obtener();
    if (items.length === 0) {
      aviso("Tu carrito está vacío");
      return;
    }

    var usuario = usuarioActual();
    if (!usuario) {
      siguiente = "carrito";
      window.CoreCarrito.cerrar();
      abrirAuth("Inicia sesión o crea una cuenta para finalizar tu compra.");
      return;
    }

    var total = items.reduce(function (suma, it) {
      return suma + it.precio * it.cantidad;
    }, 0);

    usuario.compras = usuario.compras || [];
    usuario.compras.push({
      id: "CP-" + Date.now().toString(36).toUpperCase(),
      fecha: new Date().toISOString(),
      items: items,
      total: total
    });
    guardarUsuario(usuario);

    window.CoreCarrito.vaciar();
    window.CoreCarrito.cerrar();
    aviso("¡Compra registrada en tu cuenta!");
  });

  /* ===== Cerrar sesión ===== */
  $("cerrar-sesion").addEventListener("click", function () {
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch (e) {}
    if (window.CoreCarrito) window.CoreCarrito.cambiarUsuario(null);
    actualizarMenu();
    cerrarModal();
    aviso("Sesión cerrada");
  });

  /* ===== Eventos de la interfaz ===== */
  $("abrir-cuenta").addEventListener("click", abrirCuenta);
  $("abrir-compras").addEventListener("click", abrirCompras);
  $("ver-compras").addEventListener("click", abrirCompras);
  $("cerrar-modal").addEventListener("click", cerrarModal);

  document.querySelectorAll(".pestana").forEach(function (p) {
    p.addEventListener("click", function () {
      cambiarPestana(p.dataset.pestana);
    });
  });

  // clic en el fondo oscuro cierra la ventana
  modal.addEventListener("click", function (e) {
    if (e.target === modal) cerrarModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) cerrarModal();
  });

  // al cargar la página: si ya hay sesión, carga su carrito y muestra su nombre
  var sesion = usuarioActual();
  if (window.CoreCarrito) {
    window.CoreCarrito.cambiarUsuario(sesion ? sesion.correo : null);
  }
  actualizarMenu();
})();
