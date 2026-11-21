// configuracion.js
// Pantalla de configuración: unidades de medida, opciones pendientes y cerrar sesión

function iniciarConfiguracion() {
  // si no hay sesión, protegerPagina nos manda al login y paramos aquí
  if (protegerPagina() === false) {
    return;
  }

  // ----- unidades de medida -----
  // Al darle click cambia entre Métrico e Imperial y se queda guardado
  let opcionUnidades = document.getElementById("opcion-unidades");
  let textoUnidades = document.getElementById("texto-unidades");

  let unidades = localStorage.getItem("unidades");
  if (unidades === null) {
    unidades = "Métrico";
  }
  textoUnidades.textContent = unidades;

  opcionUnidades.addEventListener("click", function (evento) {
    evento.preventDefault();

    if (unidades === "Métrico") {
      unidades = "Imperial";
    } else {
      unidades = "Métrico";
    }

    localStorage.setItem("unidades", unidades);
    textoUnidades.textContent = unidades;
  });

  // ----- opciones que todavía no tienen pantalla (idioma y soporte) -----
  let pendientes = document.querySelectorAll(".pendiente");

  for (let i = 0; i < pendientes.length; i++) {
    pendientes[i].addEventListener("click", function (evento) {
      evento.preventDefault();
      alert("Esta opción estará disponible pronto");
    });
  }

  // ----- cerrar sesión -----
  let botonCerrar = document.getElementById("boton-cerrar-sesion");
  botonCerrar.addEventListener("click", preguntarCerrarSesion);
}

iniciarConfiguracion();