// cultivos.js
// Lógica de todas las pantallas de Cultivos. Los datos se guardan en localStorage
// con las funciones de comun.js. Cada parte solo se ejecuta si su pantalla está abierta.

const CLAVE_CULTIVOS = "cultivos";

// Cultivos que existen la primera vez (los mismos del Figma)
function cultivosDeEjemplo() {
  return [
    { id: 1, nombre: "Maíz - Lote 1", tipo: "cereal", terreno: "Lote El Progreso", ubicacion: "Finca el Manantial Norte", etapa: "Floración", estado: "Óptimo", fechaSiembra: "2026-02-12", area: 2.5, rendimiento: 7.2, notas: "Cultivo en etapa de floración, sin novedades registradas.", fuente: "Río", caudal: 120, latitud: "4.85921", longitud: "-74.05812", habilitado: true },
    { id: 2, nombre: "Café - Lote 2", tipo: "cafe", terreno: "Terreno de Café", ubicacion: "Finca el Manantial Sur", etapa: "Maduración", estado: "Revisar", fechaSiembra: "2025-09-03", area: 1.8, rendimiento: 1.5, notas: "Revisar la humedad del suelo.", fuente: "Pozo", caudal: 80, latitud: "4.85810", longitud: "-74.05790", habilitado: true },
    { id: 3, nombre: "Fríjol - Lote 3", tipo: "leguminosa", terreno: "Terreno Loma", ubicacion: "Finca el Manantial Este", etapa: "Siembra", estado: "Alerta plaga", fechaSiembra: "2026-10-20", area: 1.2, rendimiento: 1.8, notas: "Se reportó plaga en el lote.", fuente: "Acueducto", caudal: 60, latitud: "4.86011", longitud: "-74.05655", habilitado: true },
    { id: 4, nombre: "Tomate - Lote 4", tipo: "hortaliza", terreno: "Terreno 1", ubicacion: "Finca el Manantial Oeste", etapa: "Crecimiento", estado: "Óptimo", fechaSiembra: "2026-08-15", area: 0.8, rendimiento: 40, notas: "Crecimiento normal.", fuente: "Río", caudal: 100, latitud: "4.85700", longitud: "-74.05900", habilitado: true }
  ];
}

function obtenerCultivos() {
  return obtenerLista(CLAVE_CULTIVOS, cultivosDeEjemplo());
}

// Solo los cultivos que no se han inhabilitado
function cultivosHabilitados() {
  return obtenerCultivos().filter(function (cultivo) {
    return cultivo.habilitado;
  });
}

// El cultivo del ?id= de la dirección, o el primero si no viene ninguno
// Si no hay ningún cultivo guardado se vuelve a la lista
function cultivoDeLaPagina(lista) {
  let cultivo = buscarPorId(lista, idDeLaDireccion());

  if (cultivo === null) {
    cultivo = lista[0];
  }

  if (cultivo === undefined) {
    alert("No hay cultivos registrados todavía");
    window.location.href = "cultivos.html";
    throw new Error("sin cultivos");
  }

  return cultivo;
}

// Clase de color de la insignia según el estado
function claseInsignia(estado) {
  if (estado === "Revisar") return "insignia_revisar";
  if (estado === "Alerta plaga") return "insignia_alerta";
  return "insignia_optimo";
}

function ponerTexto(id, texto) {
  let elemento = document.getElementById(id);

  if (elemento !== null) {
    elemento.textContent = texto;
  }
}

// ================== LISTA DE CULTIVOS ==================
function mostrarListaCultivos() {
  let contenedor = document.getElementById("listaCultivos");

  if (contenedor === null) {
    return;
  }

  let html = "";
  let lista = cultivosHabilitados();

  for (let i = 0; i < lista.length; i++) {
    let c = lista[i];
    html += `
      <div class="col-12 col-md-6 col-lg-3 tarjeta-buscable">
        <a href="ver-cultivo.html?id=${c.id}" class="tarjeta p-3 rounded-4 d-flex justify-content-between align-items-center text-decoration-none h-100">
          <div>
            <h6 class="m-0 text-white fw-bold">${textoSeguro(c.nombre)}</h6>
            <p class="m-0 small texto_gris">Etapa: ${textoSeguro(c.etapa)}</p>
          </div>
          <span class="insignia ${claseInsignia(c.estado)}">${textoSeguro(c.estado)}</span>
        </a>
      </div>`;
  }

  if (lista.length === 0) {
    html = '<p class="texto_gris">No hay cultivos registrados. Crea uno con "+ Nuevo".</p>';
  }

  contenedor.innerHTML = html;
  activarBuscadorDeLista("buscadorCultivos", ".tarjeta-buscable");
}

// ================== CREAR CULTIVO ==================
function activarCrearCultivo() {
  let formulario = document.getElementById("formCultivo");

  if (formulario === null) {
    return;
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let nombre = document.getElementById("nombre").value.trim();
    let terreno = document.querySelector('input[name="terreno"]:checked');

    if (nombre.length < 3) {
      alert("El nombre del cultivo debe tener mínimo 3 letras");
      return;
    }

    if (terreno === null) {
      alert("Selecciona el terreno donde vas a sembrar");
      return;
    }

    let lista = obtenerCultivos();
    let nombreTerreno = document.querySelector('label[for="' + terreno.id + '"]').textContent;

    lista.push({
      id: nuevoId(lista),
      nombre: nombre,
      tipo: document.getElementById("tipo").value,
      terreno: nombreTerreno,
      ubicacion: "Finca el Manantial",
      etapa: "Siembra",
      estado: "Óptimo",
      fechaSiembra: document.getElementById("fecha").value,
      area: Number(document.getElementById("area").value),
      rendimiento: 0,
      notas: document.getElementById("notas").value.trim(),
      fuente: "Río",
      caudal: 0,
      latitud: "",
      longitud: "",
      habilitado: true
    });

    guardarLista(CLAVE_CULTIVOS, lista);
    registrarEvento("Cultivo registrado", "Se agregó " + nombre + " en " + nombreTerreno, "cultivos", "bi-plus-circle", "success");
    window.location.href = "cultivos.html?mensaje=guardado";
  });
}

// ================== VER CULTIVO ==================
function mostrarCultivo() {
  if (document.getElementById("verNombre") === null) {
    return;
  }

  let c = cultivoDeLaPagina(obtenerCultivos());

  ponerTexto("verNombre", c.nombre);
  ponerTexto("verEstado", c.estado);
  ponerTexto("verUbicacion", c.ubicacion);
  ponerTexto("verTerreno", c.terreno);
  ponerTexto("verEtapa", c.etapa);
  ponerTexto("verRendimiento", c.rendimiento + " ton/ha");
  ponerTexto("verArea", c.area + " ha");
  ponerTexto("verFecha", fechaBonita(c.fechaSiembra));
  ponerTexto("verNotas", c.notas || "Sin descripción.");
  ponerTexto("verFuente", c.fuente);
  ponerTexto("verCaudal", c.caudal + " L/min");
  ponerTexto("verLatitud", c.latitud ? c.latitud + "° N" : "----");
  ponerTexto("verLongitud", c.longitud ? c.longitud + "° O" : "----");

  document.getElementById("enlaceEditar").href = "editar-cultivo.html?id=" + c.id;
}

// ================== EDITAR CULTIVO ==================
// Pone en un <select> la opción cuyo texto coincide (si no existe la agrega)
function elegirOpcion(select, texto) {
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].text === texto || select.options[i].value === texto) {
      select.selectedIndex = i;
      return;
    }
  }

  select.add(new Option(texto, texto, true, true));
}

function activarEditarCultivo() {
  let formulario = document.getElementById("formEditarCultivo");

  if (formulario === null) {
    return;
  }

  let lista = obtenerCultivos();
  let c = cultivoDeLaPagina(lista);

  // llenamos el formulario con los datos guardados
  document.getElementById("editNombreCultivo").value = c.nombre;
  elegirOpcion(document.getElementById("editTipoCultivo"), c.tipo);
  elegirOpcion(document.getElementById("editTerrenoLote"), c.terreno);
  document.getElementById("editUbicacion").value = c.ubicacion;
  elegirOpcion(document.getElementById("editEtapa"), c.etapa);
  document.getElementById("editFechaSiembra").value = c.fechaSiembra;
  document.getElementById("editArea").value = c.area;
  document.getElementById("editRendimiento").value = c.rendimiento;
  document.getElementById("editNotas").value = c.notas;
  document.getElementById("editCaudal").value = c.caudal;
  formulario.elements["latitud"].value = c.latitud;
  formulario.elements["longitud"].value = c.longitud;

  let fuentes = formulario.elements["fuenteHidricaCultivo"];
  for (let i = 0; i < fuentes.length; i++) {
    fuentes[i].checked = fuentes[i].nextElementSibling.textContent.trim() === c.fuente;
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let nombre = document.getElementById("editNombreCultivo").value.trim();

    if (nombre.length < 3) {
      alert("El nombre del cultivo debe tener mínimo 3 letras");
      return;
    }

    let terreno = document.getElementById("editTerrenoLote");
    let etapa = document.getElementById("editEtapa");
    let fuente = formulario.querySelector('input[name="fuenteHidricaCultivo"]:checked');

    c.nombre = nombre;
    c.tipo = document.getElementById("editTipoCultivo").value;
    c.terreno = terreno.options[terreno.selectedIndex].text;
    c.ubicacion = document.getElementById("editUbicacion").value.trim();
    c.etapa = etapa.options[etapa.selectedIndex].text;
    c.fechaSiembra = document.getElementById("editFechaSiembra").value;
    c.area = Number(document.getElementById("editArea").value);
    c.rendimiento = Number(document.getElementById("editRendimiento").value);
    c.notas = document.getElementById("editNotas").value.trim();
    c.caudal = Number(document.getElementById("editCaudal").value);
    c.latitud = formulario.elements["latitud"].value.trim();
    c.longitud = formulario.elements["longitud"].value.trim();
    if (fuente !== null) {
      c.fuente = fuente.nextElementSibling.textContent.trim();
    }

    guardarLista(CLAVE_CULTIVOS, lista);
    registrarEvento("Cultivo actualizado", "Se editó " + c.nombre, "cultivos", "bi-pencil-square", "success");
    window.location.href = "cultivos.html?mensaje=guardado";
  });
}

// ================== INHABILITAR CULTIVO ==================
function activarInhabilitarCultivo() {
  let contenedor = document.getElementById("listaInhabilitar");

  if (contenedor === null) {
    return;
  }

  let html = "";
  let lista = cultivosHabilitados();
  let clases = { "Óptimo": "optimo", "Revisar": "revisar", "Alerta plaga": "alerta" };

  for (let i = 0; i < lista.length; i++) {
    let c = lista[i];
    html += `
      <label class="tarjeta p-3 rounded-4 d-flex justify-content-between align-items-center tarjeta-buscable" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3">
          <input type="checkbox" name="cultivosEliminar" value="${c.id}" class="form-check-input m-0">
          <div>
            <strong class="d-block">${textoSeguro(c.nombre)}</strong>
            <span class="texto_gris small">Etapa: ${textoSeguro(c.etapa)}</span>
          </div>
        </div>
        <span class="badge-estado badge-estado--${clases[c.estado] || "optimo"}">${textoSeguro(c.estado)}</span>
      </label>`;
  }

  contenedor.innerHTML = html;
  activarBuscadorDeLista("buscadorInhabilitar", ".tarjeta-buscable");

  document.getElementById("botonInhabilitar").addEventListener("click", function (evento) {
    evento.preventDefault();

    let marcados = document.querySelectorAll('input[name="cultivosEliminar"]:checked');

    if (marcados.length === 0) {
      alert("Selecciona al menos un cultivo");
      return;
    }

    if (confirm("¿Seguro que quieres inhabilitar " + marcados.length + " cultivo(s)?") === false) {
      return;
    }

    let todos = obtenerCultivos();

    for (let i = 0; i < marcados.length; i++) {
      let cultivo = buscarPorId(todos, Number(marcados[i].value));
      cultivo.habilitado = false;
      registrarEvento("Cultivo inhabilitado", "Se inhabilitó " + cultivo.nombre, "cultivos", "bi-slash-circle", "danger");
    }

    guardarLista(CLAVE_CULTIVOS, todos);
    window.location.href = "cultivos.html?mensaje=inhabilitado";
  });
}

// ================== FASE FENOLÓGICA ==================
// Recomendaciones y próxima etapa según la etapa del cultivo
const FASES = {
  "Siembra": { siguiente: "Germinación", dias: 10, consejos: ["Mantener el suelo húmedo para la germinación", "Revisar que no haya hormigas ni pájaros en el lote", "Evitar encharcamientos", "Aplicar fertilización de arranque"] },
  "Germinación": { siguiente: "Crecimiento", dias: 15, consejos: ["Riego ligero y frecuente", "Vigilar plagas de plántulas", "Controlar malezas alrededor", "Reponer las plantas que no nacieron"] },
  "Crecimiento": { siguiente: "Floración", dias: 30, consejos: ["Aumentar el riego según el clima", "Vigilar plagas del follaje", "Aporcar las plantas", "Aplicar fertilización nitrogenada"] },
  "Floración": { siguiente: "Maduración", dias: 18, consejos: ["Mantener un riego constante, la floración es sensible al estrés hídrico", "Vigilar aparición de plagas del follaje durante esta etapa", "Evitar labores mecánicas cerca de la raíz", "Aplicar fertilización de refuerzo"] },
  "Maduración": { siguiente: "Cosecha", dias: 25, consejos: ["Reducir el riego poco a poco", "Vigilar hongos en frutos", "Preparar herramientas de cosecha", "Revisar el punto de madurez"] }
};

function activarFaseFenologica() {
  let selector = document.getElementById("detalleCultivoFase");

  if (selector === null) {
    return;
  }

  let lista = cultivosHabilitados();
  let caja = selector.querySelector(".lista");

  // armamos las opciones con los cultivos guardados
  let html = "";
  for (let i = 0; i < lista.length; i++) {
    html += `<div class="opcion" data-id="${lista[i].id}">${textoSeguro(lista[i].nombre)}</div>`;
  }
  caja.innerHTML = html;

  let opciones = caja.querySelectorAll(".opcion");
  for (let i = 0; i < opciones.length; i++) {
    opciones[i].addEventListener("click", function () {
      mostrarFase(buscarPorId(lista, Number(opciones[i].dataset.id)));
      selector.removeAttribute("open");
    });
  }

  mostrarFase(cultivoDeLaPagina(lista));
}

function mostrarFase(cultivo) {
  let fase = FASES[cultivo.etapa] || FASES["Siembra"];
  let colores = ["punto-verde", "punto-rojo", "punto-amarillo", "punto-azul"];

  ponerTexto("cultivoActualFase", cultivo.nombre);
  ponerTexto("faseEtapa", cultivo.etapa.toUpperCase());
  ponerTexto("faseSiguiente", fase.siguiente);
  ponerTexto("faseDias", "en " + fase.dias + " Días");

  let html = "";
  for (let i = 0; i < fase.consejos.length; i++) {
    html += `
      <div class="recomendacion">
        <span class="punto ${colores[i]}"></span>
        <span>${fase.consejos[i]}</span>
      </div>`;
  }
  document.getElementById("faseConsejos").innerHTML = html;

  let opciones = document.querySelectorAll("#detalleCultivoFase .opcion");
  for (let i = 0; i < opciones.length; i++) {
    opciones[i].classList.toggle("opcion-activa", Number(opciones[i].dataset.id) === cultivo.id);
  }
}

// ================== DÍA DE COSECHA ==================
// Días que tarda cada tipo de cultivo desde la siembra hasta la cosecha
const CICLOS = { cereal: 120, maiz: 120, cafe: 240, leguminosa: 90, hortaliza: 100, platano: 365, yuca: 300 };

function mostrarDiaCosecha() {
  if (document.getElementById("cosechaFecha") === null) {
    return;
  }

  let c = cultivoDeLaPagina(cultivosHabilitados());
  let ciclo = CICLOS[c.tipo] || 120;
  let meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  let siembra = new Date(c.fechaSiembra + "T00:00:00");
  let cosecha = new Date(siembra);
  cosecha.setDate(cosecha.getDate() + ciclo);

  // días que lleva sembrado (entre 0 y el ciclo completo)
  let dias = Math.floor((new Date() - siembra) / 86400000);
  dias = Math.max(0, Math.min(dias, ciclo));
  let avance = Math.round((dias / ciclo) * 100);

  ponerTexto("cosechaNombre", c.nombre);
  ponerTexto("cosechaSiembra", "Sembrado: " + siembra.getDate() + " " + meses[siembra.getMonth()] + " " + siembra.getFullYear());
  ponerTexto("cosechaFecha", cosecha.getDate() + " " + meses[cosecha.getMonth()] + " " + cosecha.getFullYear());
  ponerTexto("cosechaDia", "Día " + dias + " de " + ciclo);

  let barra = document.getElementById("cosechaBarra");
  barra.style.width = avance + "%";
  barra.parentElement.setAttribute("aria-valuenow", avance);
}

mostrarListaCultivos();
activarCrearCultivo();
mostrarCultivo();
activarEditarCultivo();
activarInhabilitarCultivo();
activarFaseFenologica();
mostrarDiaCosecha();
