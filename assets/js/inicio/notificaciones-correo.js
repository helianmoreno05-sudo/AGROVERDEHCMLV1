// notificaciones-correo.js
// Alertas por correo y por SMS: carga lo guardado, valida y guarda

// ids de los interruptores (switches) que hay en la pantalla
let interruptores = ["alertaClima", "alertaStock", "reportesSemanales", "alertaCorreo", "alertaSms"];

let campoCorreo = document.getElementById("correo");
let campoTelefono = document.getElementById("telefono");
let botonGuardar = document.querySelector(".boton-guardar");

// Pone en las tarjetas de arriba el correo y el teléfono que estén escritos abajo
function actualizarTextos() {
  document.getElementById("textoCorreo").textContent = campoCorreo.value;
  document.getElementById("textoTelefono").textContent = campoTelefono.value;
}

function iniciarAlertas() {
  // si no hay sesión, protegerPagina nos manda al login y paramos aquí
  if (protegerPagina() === false) {
    return;
  }

  let usuario = obtenerUsuarioActual();

  // cada usuario guarda sus propias alertas, por eso la llave lleva su correo
  let llave = "alertas_" + usuario.correo;
  let guardado = localStorage.getItem(llave);

  if (guardado === null) {
    // primera vez: usamos el correo con el que se registró
    campoCorreo.value = usuario.correo;
  } else {
    // ya había guardado antes: ponemos todo como lo dejó
    let datos = JSON.parse(guardado);

    for (let i = 0; i < interruptores.length; i++) {
      document.getElementById(interruptores[i]).checked = datos[interruptores[i]];
    }

    campoCorreo.value = datos.correo;
    campoTelefono.value = datos.telefono;
  }

  actualizarTextos();

  // ----- botón guardar -----
  botonGuardar.addEventListener("click", function () {
    let correo = campoCorreo.value.trim();
    let telefono = campoTelefono.value.trim();

    if (correoValido(correo) === false) {
      alert("Escribe un correo válido, por ejemplo tu@correo.com");
      return;
    }

    // el teléfono solo es obligatorio si dejó activadas las alertas por SMS.
    // Le quitamos los espacios y revisamos que sea +57 y 10 números.
    let telefonoSinEspacios = telefono.replace(/ /g, "");
    let alertaSms = document.getElementById("alertaSms");

    if (alertaSms.checked === true && /^\+57[0-9]{10}$/.test(telefonoSinEspacios) === false) {
      alert("El teléfono debe verse así: +57 300 123 4567");
      return;
    }

    // armamos un objeto con todo lo que hay en la pantalla y lo guardamos
    let datos = { correo: correo, telefono: telefono };

    for (let i = 0; i < interruptores.length; i++) {
      datos[interruptores[i]] = document.getElementById(interruptores[i]).checked;
    }

    localStorage.setItem(llave, JSON.stringify(datos));
    actualizarTextos();
    alert("Alertas guardadas");
  });
}

iniciarAlertas();