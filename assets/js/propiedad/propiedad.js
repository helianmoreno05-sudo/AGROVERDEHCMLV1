// propiedad.js
// Lógica de las pantallas de Propiedad. Los datos se guardan en localStorage (comun.js).

const CLAVE_PROPIEDADES = "propiedades";

function propiedadesDeEjemplo() {
  return [
    { id: 1, nombre: "Santandercito", tipo: "Finca", zona: "sur", ubicacion: "Santander", area: 3.2, notas: "Finca en zona de ladera con buena disponibilidad de agua.", habilitado: true },
    { id: 2, nombre: "Reserva", tipo: "Lote", zona: "Casa", ubicacion: "Cundinamarca", area: 1.1, notas: "Lote junto a la casa principal.", habilitado: true },
    { id: 3, nombre: "Finca el manantial", tipo: "Finca", zona: "Norte", ubicacion: "valle del cauca", area: 0.8, notas: "1.750 metros sobre el nivel del mar, en zona rural del municipio del valle del cauca.", habilitado: true }
  ];
}

function propiedadesHabilitadas() {
  return obtenerLista(CLAVE_PROPIEDADES, propiedadesDeEjemplo()).filter(function (p) { return p.habilitado; });
}

// "sur" -> "badge-sur", "Casa" -> "badge-casa"
function claseZona(zona) {
  return "badge-" + zona.toLowerCase();
}

// Los botones de volver de estas pantallas son <button>: regresan a la página anterior
function activarBotonesComunes() {
  let volver = document.querySelector(".boton-volver");
  if (volver !== null) {
    volver.addEventListener("click", function () {
      window.history.back();
    });
  }

  let nuevo = document.querySelector(".boton-nuevo");
  if (nuevo !== null) {
    nuevo.addEventListener("click", function () {
      window.location.href = "crear-propiedad.html";
    });
  }

  activarBuscadorDeLista("inputBuscar", ".tarjeta-propiedad");
}

// ================== LISTA DE PROPIEDADES ==================
function mostrarPropiedades() {
  let contenedor = document.getElementById("listaPropiedades");

  // en inhabilitar-propiedad la lista lleva radios, por eso se revisa el título
  if (contenedor === null || document.getElementById("botonInhabilitarPropiedad") !== null) {
    return;
  }

  let lista = propiedadesHabilitadas();
  let html = "";

  for (let i = 0; i < lista.length; i++) {
    let p = lista[i];
    html += `
      <a href="ver-etapa.html?id=${p.id}" class="tarjeta-propiedad d-flex align-items-center justify-content-between p-3 px-md-4 py-md-3 text-decoration-none">
        <div>
          <h2 class="nombre-propiedad m-0 fs-5">${textoSeguro(p.nombre)}</h2>
          <span class="tipo-propiedad">${textoSeguro(p.tipo)}</span>
        </div>
        <span class="badge-ubicacion ${claseZona(p.zona)} px-4 py-1">${textoSeguro(p.zona)}</span>
      </a>`;
  }

  contenedor.innerHTML = html || '<p class="texto_gris">No hay propiedades registradas.</p>';

  // el botón rojo de esta pantalla lleva a la pantalla de inhabilitar
  let botonRojo = document.querySelector(".boton-inhabilitar");
  botonRojo.addEventListener("click", function () {
    window.location.href = "inhabilitar-propiedad.html";
  });
}

// ================== CREAR PROPIEDAD ==================
function activarCrearPropiedad() {
  let formulario = document.getElementById("formNuevaPropiedad");

  if (formulario === null) {
    return;
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let nombre = document.getElementById("nombrePropiedad").value.trim();
    let ubicacion = document.getElementById("ubicacionPropiedad").value.trim();

    if (nombre.length < 3) {
      alert("El nombre de la propiedad debe tener mínimo 3 letras");
      return;
    }

    if (ubicacion === "") {
      alert("Escribe la ubicación de la propiedad");
      return;
    }

    let lista = obtenerLista(CLAVE_PROPIEDADES, propiedadesDeEjemplo());
    lista.push({
      id: nuevoId(lista),
      nombre: nombre,
      tipo: "Finca",
      zona: "Norte",
      ubicacion: ubicacion,
      area: 0,
      notas: document.getElementById("notasPropiedad").value.trim(),
      habilitado: true
    });

    guardarLista(CLAVE_PROPIEDADES, lista);
    registrarEvento("Propiedad creada", nombre + " en " + ubicacion, "inventario", "bi-house-add", "success");
    window.location.href = "../perfil/perfil.html?mensaje=guardado";
  });
}

// ================== INHABILITAR PROPIEDAD ==================
function activarInhabilitarPropiedad() {
  let boton = document.getElementById("botonInhabilitarPropiedad");

  if (boton === null) {
    return;
  }

  let lista = propiedadesHabilitadas();
  let html = "";

  for (let i = 0; i < lista.length; i++) {
    let p = lista[i];
    html += `
      <label class="tarjeta-propiedad d-flex align-items-center justify-content-between p-3 px-md-4 py-md-3">
        <div class="d-flex align-items-center gap-3">
          <input type="radio" name="propiedadSeleccionada" value="${p.id}" class="radio-seleccion">
          <div>
            <h2 class="nombre-propiedad m-0 fs-5">${textoSeguro(p.nombre)}</h2>
            <span class="tipo-propiedad">${textoSeguro(p.tipo)}</span>
          </div>
        </div>
        <span class="badge-ubicacion ${claseZona(p.zona)} px-4 py-1">${textoSeguro(p.zona)}</span>
      </label>`;
  }

  document.getElementById("listaPropiedades").innerHTML = html;

  boton.addEventListener("click", function (evento) {
    evento.preventDefault();

    let elegida = document.querySelector('input[name="propiedadSeleccionada"]:checked');

    if (elegida === null) {
      alert("Selecciona la propiedad que quieres inhabilitar");
      return;
    }

    let todas = obtenerLista(CLAVE_PROPIEDADES, propiedadesDeEjemplo());
    let propiedad = buscarPorId(todas, Number(elegida.value));

    if (confirm("¿Seguro que quieres inhabilitar " + propiedad.nombre + "?") === false) {
      return;
    }

    propiedad.habilitado = false;
    guardarLista(CLAVE_PROPIEDADES, todas);
    registrarEvento("Propiedad inhabilitada", propiedad.nombre, "inventario", "bi-slash-circle", "danger");
    window.location.href = "ver-propiedad.html?mensaje=inhabilitado";
  });
}

// ================== VER ETAPA DE UNA PROPIEDAD ==================
function mostrarEtapa() {
  let titulo = document.getElementById("etapaPropiedad");

  if (titulo === null) {
    return;
  }

  let lista = propiedadesHabilitadas();
  let propiedad = buscarPorId(lista, idDeLaDireccion()) || lista[0];

  titulo.textContent = propiedad.nombre;
  document.getElementById("etapaRegion").textContent = propiedad.ubicacion;
  document.getElementById("etapaArea").textContent = propiedad.area ? String(propiedad.area).replace(".", ",") + " ha" : "----";
  document.getElementById("etapaNotas").textContent = propiedad.notas || "Sin descripción.";
}

activarBotonesComunes();
mostrarPropiedades();
activarCrearPropiedad();
activarInhabilitarPropiedad();
mostrarEtapa();
