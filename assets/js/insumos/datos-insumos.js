// datos-insumos.js
// Datos de insumos, proveedores y usos que comparten las pantallas de Insumos
// (y el reporte de consumo). Se guardan en localStorage con las funciones de comun.js.

const CLAVE_INSUMOS = "insumos";
const CLAVE_PROVEEDORES = "proveedores";
const CLAVE_USOS = "usosInsumos";

function insumosDeEjemplo() {
  return [
    { id: 1, nombre: "Fertilizante NPK", categoria: "Fertilizante", cantidad: 18, unidad: "sacos", minimo: 5, precio: 63000, codigo: "7501234567890", llegada: "2026-03-10", caducidad: "2027-03-10", cultivo: "Maíz - Lote 1", descripcion: "Fertilizante NPK de uso agrícola que aporta nitrógeno, fósforo y potasio, esenciales para el crecimiento, desarrollo y producción de los cultivos. Recomendado para mejorar la nutrición del suelo y favorecer un desarrollo saludable de las plantas.", habilitado: true },
    { id: 2, nombre: "Herbicida selectivo", categoria: "Herbicida", cantidad: 9, unidad: "L", minimo: 3, precio: 45000, codigo: "7501234567891", llegada: "2026-04-02", caducidad: "2027-04-02", cultivo: "Maíz - Lote 1", descripcion: "Herbicida selectivo para el control de malezas sin afectar el cultivo.", habilitado: true },
    { id: 3, nombre: "Fungicida orgánico", categoria: "Fungicida", cantidad: 3, unidad: "und", minimo: 5, precio: 35000, codigo: "7501234567892", llegada: "2026-05-20", caducidad: "2026-12-20", cultivo: "Café - Lote 2", descripcion: "Fungicida orgánico para la prevención de hongos en hojas y tallos.", habilitado: true },
    { id: 4, nombre: "Semilla de maíz", categoria: "Semilla", cantidad: 50, unidad: "kg", minimo: 10, precio: 12000, codigo: "7501234567893", llegada: "2026-01-15", caducidad: "2027-01-15", cultivo: "Maíz - Lote 1", descripcion: "Semilla de maíz certificada para siembra.", habilitado: true }
  ];
}

function proveedoresDeEjemplo() {
  return [
    { id: 1, nombre: "Agroinsumos del Valle", telefono: "310 000 0001", correo: "ventas@agrovalle.com", insumos: "Urea, NPK", llegada: "" },
    { id: 2, nombre: "Fertisanos S.A.S", telefono: "310 000 0002", correo: "contacto@fertisanos.com", insumos: "Fungicidas", llegada: "" },
    { id: 3, nombre: "Campo Verde Ltda", telefono: "310 000 0003", correo: "info@campoverde.com", insumos: "Cal, Abonos", llegada: "" }
  ];
}

// Cada vez que se usa un insumo en un cultivo queda un registro aquí
function usosDeEjemplo() {
  return [
    { id: 1, insumo: "Fertilizante NPK", cultivo: "Maíz - Lote 1", cantidad: 4, unidad: "sacos", fecha: fechaDeHoy(3), observaciones: "Aplicado en floración" },
    { id: 2, insumo: "Herbicida selectivo", cultivo: "Maíz - Lote 1", cantidad: 3, unidad: "L", fecha: fechaDeHoy(5), observaciones: "Control de maleza" },
    { id: 3, insumo: "Fungicida orgánico", cultivo: "Café - Lote 2", cantidad: 1, unidad: "und", fecha: fechaDeHoy(9), observaciones: "Prevención de hongos" },
    { id: 4, insumo: "Semilla de maíz", cultivo: "Maíz - Lote 1", cantidad: 25, unidad: "kg", fecha: fechaDeHoy(20), observaciones: "Siembra" },
    { id: 5, insumo: "Fertilizante NPK", cultivo: "Fríjol - Lote 3", cantidad: 2, unidad: "sacos", fecha: fechaDeHoy(12), observaciones: "Fertilización de arranque" }
  ];
}

function obtenerInsumos() {
  return obtenerLista(CLAVE_INSUMOS, insumosDeEjemplo());
}

function insumosHabilitados() {
  return obtenerInsumos().filter(function (insumo) { return insumo.habilitado; });
}

function obtenerProveedores() {
  return obtenerLista(CLAVE_PROVEEDORES, proveedoresDeEjemplo());
}

function obtenerUsosInsumos() {
  return obtenerLista(CLAVE_USOS, usosDeEjemplo());
}

// Busca un insumo por su nombre (los usos guardan el nombre)
function insumoPorNombre(lista, nombre) {
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].nombre === nombre) {
      return lista[i];
    }
  }

  return null;
}

// Un insumo está por agotarse cuando le queda lo mínimo o menos
function porAgotarse(insumo) {
  return insumo.cantidad <= insumo.minimo;
}

// 63000 -> "$63.000"
function pesos(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CO");
}

// Nombres de los cultivos que se pueden elegir (los del módulo de Cultivos si existen)
function nombresDeCultivos() {
  let cultivos = leerLista("cultivos");
  let nombres = [];

  for (let i = 0; i < cultivos.length; i++) {
    if (cultivos[i].habilitado) {
      nombres.push(cultivos[i].nombre);
    }
  }

  // también los que aparecen en los usos guardados
  let usos = obtenerUsosInsumos();
  for (let i = 0; i < usos.length; i++) {
    if (!nombres.includes(usos[i].cultivo)) {
      nombres.push(usos[i].cultivo);
    }
  }

  return nombres;
}
