// datos de las plagas k se comparten entre todas las pantallas
const CLAVE_PLAGAS = "agroverde_plagas";

// plagas de ejemplo para la primera vez k se abre el proyecto
const plagas_iniciales = [
    {
        id: 1,
        nombre: "Gusano",
        fecha: "2026-06-14",
        ubicacion: "Maíz - Lote 1",
        estado: "Avanzada",
        notas: "Se observan hojas dañadas en el borde del lote. Aplicar control biológico.",
        habilitada: true
    },
    {
        id: 2,
        nombre: "Broca del café",
        fecha: "2026-06-14",
        ubicacion: "Café - Lote 2",
        estado: "Iniciada",
        notas: "Primeros frutos afectados. Revisar de nuevo en una semana.",
        habilitada: true
    }
];

// lee las plagas guardadas (si no hay ninguna, deja las de ejemplo)
// cada propiedad tiene sus plagas: la principal (id 3) usa la llave normal
function clave_plagas() {
    const id = localStorage.getItem("propiedadActual");
    return id === null || id === "3" ? CLAVE_PLAGAS : CLAVE_PLAGAS + "_prop" + id;
}

function obtener_plagas() {
    const guardado = localStorage.getItem(clave_plagas());

    if (guardado === null) {
        // solo la propiedad principal trae plagas de ejemplo
        const iniciales = clave_plagas() === CLAVE_PLAGAS ? plagas_iniciales : [];
        guardar_plagas(iniciales);
        return iniciales;
    }

    try {
        return JSON.parse(guardado);
    } catch (error) {
        return [];
    }
}

// guarda la lista completa de plagas
function guardar_plagas(lista) {
    localStorage.setItem(clave_plagas(), JSON.stringify(lista));
}

// busca el siguiente id k esta libre
function crear_id(lista) {
    if (lista.length === 0) return 1;
    return Math.max.apply(null, lista.map(function (plaga) { return plaga.id; })) + 1;
}

// pasa la fecha de aaaa-mm-dd a dd/mm/aaaa
function formatear_fecha(fecha) {
    const partes = fecha.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// evita k lo k escriba el usuario dañe el html de la pagina
function escapar_html(texto) {
    const caja = document.createElement("div");
    caja.textContent = texto;
    return caja.innerHTML;
}
// el color de la insignia depende del estado de la plaga
function clase_insignia(estado) {
    if (estado === "Avanzada") return "insignia_alerta";
    if (estado === "Controlada") return "insignia_controlada";
    return "insignia_revisar";
}

// llena el select de "Ubicación / Cultivo" con los cultivos registrados
// (y con las ubicaciones que ya tengan las plagas, para no perder ninguna)
function llenar_select_cultivos() {
    const select = document.getElementById("ubicacion");

    if (!select || select.tagName !== "SELECT") {
        return;
    }

    const id = localStorage.getItem("propiedadActual");
    const llave = id === null || id === "3" ? "cultivos" : "cultivos_prop" + id;
    const guardados = JSON.parse(localStorage.getItem(llave) || "[]");
    let nombres = guardados.filter(function (c) { return c.habilitado; }).map(function (c) { return c.nombre; });

    if (nombres.length === 0) {
        nombres = ["Maíz - Lote 1", "Café - Lote 2", "Fríjol - Lote 3", "Tomate - Lote 4"];
    }

    obtener_plagas().forEach(function (plaga) {
        if (!nombres.includes(plaga.ubicacion)) {
            nombres.push(plaga.ubicacion);
        }
    });

    select.innerHTML = nombres.map(function (nombre) {
        return `<option value="${escapar_html(nombre)}">${escapar_html(nombre)}</option>`;
    }).join("");
}

// elige en el select el cultivo que contenga el texto (ej. "Café" -> "Café - Lote 2")
function elegir_cultivo(texto) {
    const select = document.getElementById("ubicacion");
    const buscado = texto.toLowerCase().split("/")[0];

    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value.toLowerCase().includes(buscado)) {
            select.selectedIndex = i;
            return;
        }
    }
}

llenar_select_cultivos();
