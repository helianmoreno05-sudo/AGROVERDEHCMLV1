// insumos.js
// Funciones sencillas que comparten las pantallas de Insumos.
// Por ahora solo es frontend: nada se guarda de verdad hasta que esté la API.

// ================== CONTADOR ( - cantidad + ) ==================

// Cada contador tiene: un botón "-", un <span> con el número y un botón "+".
// La unidad (sacos, kg...) se lee del atributo data-unidad.
function activarContadores() {
  let contadores = document.querySelectorAll(".contador");

  for (let i = 0; i < contadores.length; i++) {
    let contador = contadores[i];
    let texto = contador.querySelector("span");
    let campo = contador.querySelector("input");
    let unidad = contador.dataset.unidad;
    let botones = contador.querySelectorAll("button");

    botones[0].addEventListener("click", function () {
      cambiarCantidad(texto, campo, unidad, -1);
    });

    botones[1].addEventListener("click", function () {
      cambiarCantidad(texto, campo, unidad, 1);
    });
  }
}

function cambiarCantidad(texto, campo, unidad, cambio) {
  let cantidad = parseInt(campo.value) + cambio;

  // no dejamos que baje de 1
  if (cantidad < 1) {
    cantidad = 1;
  }

  campo.value = cantidad;
  texto.textContent = cantidad + " " + unidad;
}

// ================== BUSCADOR ==================

// Filtra las tarjetas de la lista según lo que se escriba en el buscador
function activarBuscador() {
  let buscador = document.getElementById("buscador");

  if (buscador === null) {
    return;
  }

  buscador.addEventListener("input", function () {
    let texto = buscador.value.toLowerCase();
    let tarjetas = document.querySelectorAll(".item-buscable");

    for (let i = 0; i < tarjetas.length; i++) {
      let contenido = tarjetas[i].textContent.toLowerCase();

      if (contenido.includes(texto)) {
        tarjetas[i].classList.remove("d-none");
      } else {
        tarjetas[i].classList.add("d-none");
      }
    }
  });
}

// ================== MENSAJE DE GUARDADO ==================

// Si la página se abre con ?guardado=1 mostramos la ventana "Guardado correctamente"
function mostrarGuardado() {
  let ventana = document.getElementById("modal-guardado");

  if (ventana === null) {
    return;
  }

  if (window.location.search.includes("guardado=1")) {
    let modal = new bootstrap.Modal(ventana);
    modal.show();
  }
}

activarContadores();
activarBuscador();
mostrarGuardado();
