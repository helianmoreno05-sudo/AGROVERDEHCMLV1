// comun.js
// Funciones que comparten varias pantallas: usuarios, sesión, historial y notificaciones.
// Todo se guarda en localStorage (en el navegador) mientras no esté lista la API.
// Este archivo se carga SIEMPRE antes del .js de cada pantalla.

// ================== USUARIOS ==================

// Usuarios que ya existen la primera vez que se abre la página (solo para probar)
function usuariosDeEjemplo() {
  return [
    { nombre: "July Riaño", correo: "july@agroverde.com", contrasena: "123456", rol: "Administrador" },
    { nombre: "Dayan Combita", correo: "dayan@agroverde.com", contrasena: "123456", rol: "Administrador" },
    { nombre: "Derlin Caro", correo: "derlin@agroverde.com", contrasena: "123456", rol: "Administrador" },
    { nombre: "Helian Moreno", correo: "helian@agroverde.com", contrasena: "123456", rol: "Agricultor" }
  ];
}

// Trae la lista de usuarios guardados.
// Si todavía no hay ninguna, guarda los de ejemplo.
function obtenerUsuarios() {
  let guardado = localStorage.getItem("usuarios");

  if (guardado === null) {
    let ejemplo = usuariosDeEjemplo();
    guardarUsuarios(ejemplo);
    return ejemplo;
  }

  return JSON.parse(guardado);
}

function guardarUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// Busca un usuario por su correo. Si no existe devuelve null.
function buscarUsuario(correo) {
  let usuarios = obtenerUsuarios();

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].correo === correo) {
      return usuarios[i];
    }
  }

  return null;
}

// Revisa que el texto tenga forma de correo: algo@algo.algo
function correoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// ================== SESIÓN ==================

// Devuelve el usuario que tiene la sesión iniciada (o null si no hay nadie)
function obtenerUsuarioActual() {
  let correo = localStorage.getItem("usuarioActual");

  if (correo === null) {
    return null;
  }

  return buscarUsuario(correo);
}

// Se pone al principio de cada pantalla privada.
// Si no hay sesión manda al login y devuelve false.
function protegerPagina() {
  if (obtenerUsuarioActual() === null) {
    window.location.href = "../inicio-sesion/iniciar-sesion.html";
    return false;
  }

  return true;
}

// Los botones de cerrar sesión son enlaces <a>, por eso primero frenamos
// el enlace (preventDefault) y solo salimos si la persona confirma.
function preguntarCerrarSesion(evento) {
  evento.preventDefault();

  if (confirm("¿Seguro que quieres cerrar sesión?") === true) {
    localStorage.removeItem("usuarioActual");
    window.location.href = "../inicio-sesion/iniciar-sesion.html";
  }
}

// ================== HISTORIAL ==================

// Devuelve la fecha como texto: "2026-11-23". Con 0 es hoy, con 1 es ayer.
// No usamos toISOString() porque da la fecha en hora UTC y en Colombia,
// pasadas las 7 pm, ya nos daría la de mañana.
function fechaDeHoy(diasAtras) {
  let fecha = new Date();
  fecha.setDate(fecha.getDate() - diasAtras);

  let anio = fecha.getFullYear();
  let mes = fecha.getMonth() + 1;
  let dia = fecha.getDate();

  if (mes < 10) {
    mes = "0" + mes;
  }
  if (dia < 10) {
    dia = "0" + dia;
  }

  return anio + "-" + mes + "-" + dia;
}

// Eventos que ya existen la primera vez (son los mismos de la pantalla de Figma)
function eventosDeEjemplo() {
  return [
    { titulo: "Cultivo registrado", detalle: "Helian Moreno agregó un nuevo lote", tipo: "cultivos", icono: "bi-plus-circle", color: "success", fecha: fechaDeHoy(0) },
    { titulo: "Plaga reportada", detalle: "Helian marcó \"Roya\" en Finca El Manantial", tipo: "cultivos", icono: "bi-exclamation-triangle", color: "danger", fecha: fechaDeHoy(0) },
    { titulo: "Inicio de sesión", detalle: "Dayan Combita accedió al sistema", tipo: "sistema", icono: "bi-box-arrow-in-right", color: "info", fecha: fechaDeHoy(0) },
    { titulo: "Insumo actualizado", detalle: "Derlin cambió stock de \"Fertilizante\"", tipo: "insumos", icono: "bi-file-earmark-text", color: "success", fecha: fechaDeHoy(1) },
    { titulo: "Terreno inhabilitado", detalle: "Daniela inhabilitó el Lote 1", tipo: "inventario", icono: "bi-slash-circle", color: "danger", fecha: fechaDeHoy(1) },
    { titulo: "Usuario creado", detalle: "Fue creado un nuevo usuario", tipo: "sistema", icono: "bi-person-plus", color: "success", fecha: fechaDeHoy(1) }
  ];
}

// Trae el historial (el más nuevo va primero)
function obtenerHistorial() {
  let guardado = localStorage.getItem("historial");

  if (guardado === null) {
    let ejemplo = eventosDeEjemplo();
    localStorage.setItem("historial", JSON.stringify(ejemplo));
    return ejemplo;
  }

  return JSON.parse(guardado);
}

// Anota un evento nuevo al principio del historial.
// tipo: cultivos, insumos, inventario o sistema
// icono: nombre del icono de Bootstrap Icons (ej. "bi-plus-circle")
// color: success (verde), danger (rojo) o info (azul)
function registrarEvento(titulo, detalle, tipo, icono, color) {
  let historial = obtenerHistorial();

  let evento = {
    titulo: titulo,
    detalle: detalle,
    tipo: tipo,
    icono: icono,
    color: color,
    fecha: fechaDeHoy(0)
  };

  historial.unshift(evento);
  localStorage.setItem("historial", JSON.stringify(historial));
}

// ================== NOTIFICACIONES ==================

function notificacionesDeEjemplo() {
  return [
    { titulo: "Alerta climática", detalle: "Se espera helada esta noche en Finca El Manantial", leida: false },
    { titulo: "Stock mínimo", detalle: "El fertilizante NPK está por debajo del mínimo", leida: false },
    { titulo: "Plaga reportada", detalle: "Helian marcó \"Roya\" en el Lote 2", leida: false },
    { titulo: "Reporte semanal", detalle: "Ya está listo el resumen de la semana", leida: true }
  ];
}

// Trae la lista de notificaciones (si no hay ninguna, guarda las de ejemplo)
function obtenerNotificaciones() {
  let guardado = localStorage.getItem("notificaciones");

  if (guardado === null) {
    let ejemplo = notificacionesDeEjemplo();
    guardarNotificaciones(ejemplo);
    return ejemplo;
  }

  return JSON.parse(guardado);
}

function guardarNotificaciones(lista) {
  localStorage.setItem("notificaciones", JSON.stringify(lista));
}

// Cuenta cuántas notificaciones faltan por leer
function contarSinLeer() {
  let lista = obtenerNotificaciones();
  let total = 0;

  for (let i = 0; i < lista.length; i++) {
    if (lista[i].leida === false) {
      total = total + 1;
    }
  }

  return total;
}
// ================== PROPIEDAD ACTUAL ==================
// La persona trabaja en una propiedad a la vez (Finca el manantial es la 3).
// Cada propiedad tiene sus propios cultivos, terrenos, insumos, reportes y plagas.
const PROPIEDAD_PRINCIPAL = 3;

// Listas que son de toda la cuenta y no de una propiedad
const LISTAS_GENERALES = ["propiedades", "usuarios", "mensajesSoporte"];

function idPropiedadActual() {
  let id = localStorage.getItem("propiedadActual");
  return id === null ? PROPIEDAD_PRINCIPAL : Number(id);
}

function cambiarPropiedad(id) {
  localStorage.setItem("propiedadActual", id);
}

// Nombre de la propiedad en la que se está trabajando
function nombrePropiedadActual() {
  let propiedades = leerListaGeneral("propiedades");

  for (let i = 0; i < propiedades.length; i++) {
    if (propiedades[i].id === idPropiedadActual()) {
      return propiedades[i].nombre;
    }
  }

  return "Finca el manantial";
}

// La propiedad principal usa la llave normal (así no se pierde lo que ya estaba guardado);
// las demás le agregan su id: "cultivos_prop4"
function claveDePropiedad(clave, idPropiedad) {
  let id = idPropiedad === undefined ? idPropiedadActual() : idPropiedad;

  if (LISTAS_GENERALES.includes(clave) || id === PROPIEDAD_PRINCIPAL) {
    return clave;
  }

  return clave + "_prop" + id;
}

function leerListaGeneral(clave) {
  let guardado = localStorage.getItem(clave);
  return guardado === null ? [] : JSON.parse(guardado);
}

// Pone el nombre de la propiedad actual en los elementos con la clase "nombre-propiedad-actual"
function mostrarNombrePropiedad() {
  let elementos = document.querySelectorAll(".nombre-propiedad-actual");

  for (let i = 0; i < elementos.length; i++) {
    elementos[i].textContent = nombrePropiedadActual();
  }
}

document.addEventListener("DOMContentLoaded", mostrarNombrePropiedad);

// ================== DATOS DE LOS MÓDULOS ==================
// Cada módulo (cultivos, terrenos, reportes...) guarda su lista en localStorage
// con estas funciones. Cuando esté la API solo hay que cambiar estas dos primeras.

// Trae una lista guardada de la propiedad actual. Si todavía no existe, guarda la de ejemplo
// (solo la propiedad principal trae ejemplos; una propiedad nueva empieza vacía).
function obtenerLista(clave, ejemplo) {
  let guardado = localStorage.getItem(claveDePropiedad(clave));

  if (guardado === null) {
    let inicial = idPropiedadActual() === PROPIEDAD_PRINCIPAL || LISTAS_GENERALES.includes(clave) ? ejemplo : [];
    guardarLista(clave, inicial);
    return inicial;
  }

  return JSON.parse(guardado);
}

// Lee una lista sin crearla (para mirar los datos de otro módulo). Si no existe devuelve [].
function leerLista(clave) {
  let guardado = localStorage.getItem(claveDePropiedad(clave));
  return guardado === null ? [] : JSON.parse(guardado);
}

function guardarLista(clave, lista) {
  localStorage.setItem(claveDePropiedad(clave), JSON.stringify(lista));
}

// Busca un elemento por su id. Si no existe devuelve null.
function buscarPorId(lista, id) {
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id === id) {
      return lista[i];
    }
  }

  return null;
}

// Da el siguiente id libre de una lista
function nuevoId(lista) {
  let mayor = 0;

  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id > mayor) {
      mayor = lista[i].id;
    }
  }

  return mayor + 1;
}

// Lee el ?id=3 de la dirección de la página (devuelve null si no hay)
function idDeLaDireccion() {
  let parametros = new URLSearchParams(window.location.search);
  let id = parametros.get("id");

  if (id === null) {
    return null;
  }

  return Number(id);
}

// Evita que lo que escribe la persona dañe el HTML de la página
function textoSeguro(texto) {
  let caja = document.createElement("div");
  caja.textContent = texto;
  return caja.innerHTML;
}

// Muestra "2026-08-15" como "15/08/2026"
function fechaBonita(fecha) {
  if (!fecha) {
    return "----";
  }

  let partes = fecha.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Filtra las tarjetas mientras se escribe en un buscador.
// selectorTarjetas: qué elementos se esconden o se muestran (ej. ".tarjeta-cultivo")
function activarBuscadorDeLista(idBuscador, selectorTarjetas) {
  let buscador = document.getElementById(idBuscador);

  if (buscador === null) {
    return;
  }

  buscador.addEventListener("input", function () {
    let texto = buscador.value.toLowerCase();
    let tarjetas = document.querySelectorAll(selectorTarjetas);

    for (let i = 0; i < tarjetas.length; i++) {
      if (tarjetas[i].textContent.toLowerCase().includes(texto)) {
        tarjetas[i].classList.remove("d-none");
      } else {
        tarjetas[i].classList.add("d-none");
      }
    }
  });
}
