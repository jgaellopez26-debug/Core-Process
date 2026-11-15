// Barra superior: reutiliza la lógica que ya existe (carrito, cuenta, compras)
// haciendo clic en los botones del menú viejo, que quedan ocultos.
(function () {
  const $ = (id) => document.getElementById(id);
  const barra = $('barra');
  if (!barra) return;

  const clic = (id) => { const el = $(id); if (el) el.click(); };

  $('barra-carrito').addEventListener('click', () => clic('abrir-carrito'));
  $('barra-compras').addEventListener('click', () => clic('abrir-compras'));
  $('barra-entrar').addEventListener('click', () => clic('abrir-cuenta'));
  $('barra-registro').addEventListener('click', () => {
    clic('abrir-cuenta');
    const pestana = document.querySelector('.pestana[data-pestana="registro"]');
    if (pestana) pestana.click();
  });

  // Sombra al bajar
  window.addEventListener('scroll', () => {
    barra.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Contador del carrito: copia el número del menú viejo
  const contadorViejo = $('contador-menu');
  const contadorNuevo = $('barra-contador');
  function syncContador() {
    if (contadorViejo) contadorNuevo.textContent = contadorViejo.textContent;
  }
  if (contadorViejo) {
    new MutationObserver(syncContador).observe(contadorViejo, {
      childList: true, characterData: true, subtree: true
    });
  }
  syncContador();

  // Cuenta: si hay sesión, muestra el nombre en lugar de los dos botones
  const nombreViejo = $('menu-nombre');
  const entrar = $('barra-entrar');
  const registro = $('barra-registro');
  function syncCuenta() {
    const nombre = nombreViejo ? nombreViejo.textContent.trim() : '';
    const conSesion = nombreViejo && !nombreViejo.hidden && nombre;
    entrar.textContent = conSesion ? nombre : 'Iniciar sesión';
    registro.style.display = conSesion ? 'none' : '';
  }
  if (nombreViejo) {
    new MutationObserver(syncCuenta).observe(nombreViejo, {
      attributes: true, childList: true, characterData: true, subtree: true
    });
  }
  syncCuenta();
})();
