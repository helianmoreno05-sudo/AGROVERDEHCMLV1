// insumos.js
// Lógica de todas las pantallas de Insumos. Los datos vienen de datos-insumos.js
// y se guardan en localStorage. Cada parte solo se ejecuta si su pantalla está abierta.

// Colores de los puntos en orden (se repiten si hay más insumos)
const COLORES_PUNTO = ["verde", "azul", "amarillo", "rojo"];

function colorDelPunto(posicion) {
  return COLORES_PUNTO[posicion % COLORES_PUNTO.length];
}

function ponerTexto(id, texto) {
  let elemento = document.getElementById(id);

  if (elemento !== null) {
    elemento.textContent = texto;
  }
}

// Llena un <select> con una lista de textos (deja la primera opción "Seleccionar...")
function llenarSelect(select, textos) {
  let primera = select.options[0];
  select.innerHTML = "";
  select.appendChild(primera);

  for (let i = 0; i < textos.length; i++) {
    select.add(new Option(textos[i], textos[i]));
  }
}

// ================== CONTADOR ( - cantidad + ) ==================
// Cada contador tiene: un botón "-", un <span> con el número, un botón "+" y un input oculto.
function activarContadores() {
  let contadores = document.querySelectorAll(".contador");

  for (let i = 0; i < contadores.length; i++) {
    let contador = contadores[i];
    let texto = contador.querySelector("span");
    let campo = contador.querySelector("input");
    let botones = contador.querySelectorAll("button");

    botones[0].addEventListener("click", function () {
      cambiarCantidad(texto, campo, contador.dataset.unidad, -1);
    });

    botones[1].addEventListener("click", function () {
      cambiarCantidad(texto, campo, contador.dataset.unidad, 1);
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
function activarBuscador() {
  activarBuscadorDeLista("buscador", ".item-buscable");
}

// ================== INSUMOS (pantalla principal) ==================
function mostrarInventario() {
  if (document.getElementById("dato1") === null || document.getElementById("listaPrincipal") === null || document.title.indexOf("Insumos -") !== 0) {
    return;
  }

  let lista = insumosHabilitados();
  let agotarse = lista.filter(porAgotarse).length;

  ponerTexto("dato1", lista.length);
  ponerTexto("dato2", agotarse);

  let html = "";

  for (let i = 0; i < lista.length; i++) {
    let insumo = lista[i];
    let bajo = porAgotarse(insumo);
    let estado = bajo ? "bajo stock" : "disponible";

    html += `
      <details class="insumo-desplegable item-buscable"${i === 0 ? " open" : ""}>
        <summary>
          <div class="d-flex align-items-center gap-3">
            <span class="punto-insumo punto-insumo--${bajo ? "rojo" : colorDelPunto(i)}"></span>
            <div>
              <strong class="d-block">${textoSeguro(insumo.nombre)}</strong>
              <span class="${bajo ? "texto-bajo-stock" : "texto_gris"} small">${insumo.cantidad} ${textoSeguro(insumo.unidad)} ${bajo ? "- bajo stock" : "disponibles"}</span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3">
            <a href="editar-insumo.html?id=${insumo.id}" class="btn-agro-sm">Editar</a>
            <i class="bi bi-chevron-down"></i>
          </div>
        </summary>
        <div class="descripcion">
          <p class="titulo-seccion mb-1">Descripción</p>
          ${textoSeguro(insumo.descripcion || "Sin descripción.")} Cantidad disponible: ${insumo.cantidad} ${textoSeguro(insumo.unidad)}. Estado: ${estado}.
        </div>
      </details>`;
  }

  if (lista.length === 0) {
    html = '<p class="texto_gris">No hay insumos registrados. Crea uno con "+ Nuevo".</p>';
  }

  document.getElementById("listaPrincipal").innerHTML = html;
}

// ================== CREAR / EDITAR INSUMO ==================
// Lee el formulario de insumo. Devuelve null si algo está mal.
function leerFormularioInsumo() {
  let nombre = document.getElementById("nombre").value.trim();
  let cantidad = Number(document.getElementById("cantidad").value);
  let unidad = document.getElementById("medida").value.trim();
  let llegada = document.getElementById("llegada").value;
  let caducidad = document.getElementById("caducidad").value;

  if (nombre.length < 3) {
    alert("El nombre del insumo debe tener mínimo 3 letras");
    return null;
  }

  if (isNaN(cantidad) || cantidad < 0) {
    alert("Escribe una cantidad válida");
    return null;
  }

  if (unidad === "") {
    alert("Escribe la medida del insumo, por ejemplo KG o ML");
    return null;
  }

  if (llegada !== "" && caducidad !== "" && caducidad < llegada) {
    alert("La fecha de caducidad no puede ser antes de la fecha de llegada");
    return null;
  }

  return { nombre: nombre, cantidad: cantidad, unidad: unidad, llegada: llegada, caducidad: caducidad };
}

function activarCrearInsumo() {
  let formulario = document.getElementById("formCrearInsumo");

  if (formulario === null) {
    return;
  }

  let selectCultivo = document.getElementById("cultivo");
  llenarSelect(selectCultivo, nombresDeCultivos());

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let datos = leerFormularioInsumo();

    if (datos === null) {
      return;
    }

    let lista = obtenerInsumos();

    if (insumoPorNombre(lista, datos.nombre) !== null) {
      alert("Ya existe un insumo con ese nombre. Usa \"Actualizar stock\" para sumarle cantidad.");
      return;
    }

    datos.id = nuevoId(lista);
    datos.categoria = datos.nombre.split(" ")[0];
    datos.minimo = 5;
    datos.precio = 0;
    datos.codigo = "770" + String(datos.id).padStart(10, "0");
    datos.cultivo = selectCultivo.value;
    datos.descripcion = "";
    datos.habilitado = true;
    lista.push(datos);

    guardarLista(CLAVE_INSUMOS, lista);
    registrarEvento("Insumo registrado", datos.nombre + " (" + datos.cantidad + " " + datos.unidad + ")", "insumos", "bi-box-seam", "success");
    window.location.href = "insumos.html?mensaje=guardado";
  });
}

function activarEditarInsumo() {
  let formulario = document.getElementById("formEditarInsumo");

  if (formulario === null) {
    return;
  }

  let lista = obtenerInsumos();
  let insumo = buscarPorId(lista, idDeLaDireccion()) || lista[0];

  document.getElementById("nombre").value = insumo.nombre;
  document.getElementById("cantidad").value = insumo.cantidad;
  document.getElementById("medida").value = insumo.unidad;
  document.getElementById("llegada").value = insumo.llegada;
  document.getElementById("caducidad").value = insumo.caducidad;

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let datos = leerFormularioInsumo();

    if (datos === null) {
      return;
    }

    Object.assign(insumo, datos);
    guardarLista(CLAVE_INSUMOS, lista);
    registrarEvento("Insumo actualizado", "Se editó " + insumo.nombre, "insumos", "bi-file-earmark-text", "success");
    window.location.href = "insumos.html?mensaje=guardado";
  });
}

// ================== INHABILITAR INSUMO ==================
function activarInhabilitarInsumo() {
  let formulario = document.getElementById("formInhabilitarInsumo");

  if (formulario === null) {
    return;
  }

  let lista = insumosHabilitados();
  let html = "";

  for (let i = 0; i < lista.length; i++) {
    let insumo = lista[i];
    let bajo = porAgotarse(insumo);
    html += `
      <div class="opcion-insumo opcion-insumo--peligro">
        <input type="radio" name="insumo" id="i-${insumo.id}" value="${insumo.id}">
        <label for="i-${insumo.id}" class="tarjeta p-3 rounded-4">
          <div>
            <strong class="d-block">${textoSeguro(insumo.nombre)}</strong>
            <span class="${bajo ? "texto-bajo-stock" : "texto_gris"} small">${insumo.cantidad} ${textoSeguro(insumo.unidad)} ${bajo ? "- bajo stock" : "disponibles"}</span>
          </div>
          <i class="bi bi-circle"></i>
        </label>
      </div>`;
  }

  document.getElementById("listaPrincipal").innerHTML = html;

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let elegido = formulario.querySelector('input[name="insumo"]:checked');

    if (elegido === null) {
      alert("Selecciona el insumo que quieres inhabilitar");
      return;
    }

    let todos = obtenerInsumos();
    let insumo = buscarPorId(todos, Number(elegido.value));

    if (confirm("¿Seguro que quieres inhabilitar " + insumo.nombre + "?") === false) {
      return;
    }

    insumo.habilitado = false;
    guardarLista(CLAVE_INSUMOS, todos);
    registrarEvento("Insumo inhabilitado", insumo.nombre, "insumos", "bi-slash-circle", "danger");
    window.location.href = "insumos.html?mensaje=inhabilitado";
  });
}

// ================== MOVIMIENTOS DE STOCK ==================
// Suma (entrada) o resta (salida) cantidad a un insumo. Devuelve false si no alcanza.
function moverStock(insumoId, tipo, cantidad, motivo) {
  let lista = obtenerInsumos();
  let insumo = buscarPorId(lista, insumoId);

  if (tipo === "salida" && cantidad > insumo.cantidad) {
    alert("No hay suficiente " + insumo.nombre + ". Solo quedan " + insumo.cantidad + " " + insumo.unidad);
    return false;
  }

  insumo.cantidad = tipo === "entrada" ? insumo.cantidad + cantidad : insumo.cantidad - cantidad;
  guardarLista(CLAVE_INSUMOS, lista);

  let signo = tipo === "entrada" ? "+" : "-";
  registrarEvento("Stock actualizado", insumo.nombre + " " + signo + cantidad + " " + insumo.unidad + (motivo ? " (" + motivo + ")" : ""), "insumos", "bi-arrow-repeat", "success");
  return true;
}

// ================== ACTUALIZAR STOCK ==================
function activarActualizarStock() {
  let formulario = document.getElementById("formStock");

  if (formulario === null) {
    return;
  }

  let lista = insumosHabilitados();
  let elegido = buscarPorId(lista, idDeLaDireccion()) || lista[0];
  let html = "";

  for (let i = 0; i < lista.length; i++) {
    let insumo = lista[i];
    let bajo = porAgotarse(insumo);
    html += `
      <details class="insumo-desplegable" data-id="${insumo.id}"${insumo === elegido ? " open" : ""}>
        <summary>
          <div class="d-flex align-items-center gap-3">
            <span class="punto-insumo punto-insumo--${bajo ? "rojo" : "verde"}"></span>
            <div>
              <strong class="d-block">${textoSeguro(insumo.nombre)}</strong>
              <span class="${bajo ? "texto-bajo-stock" : "texto_gris"} small">${insumo.cantidad} ${textoSeguro(insumo.unidad)} ${bajo ? "- bajo stock" : "disponibles"}</span>
            </div>
          </div>
          <i class="bi bi-chevron-down"></i>
        </summary>
      </details>`;
  }

  document.getElementById("listaPrincipal").innerHTML = html;

  // el bloque "Ajustar stock" se mueve dentro del insumo que esté abierto
  let ajuste = document.createElement("div");
  ajuste.className = "descripcion";
  ajuste.innerHTML = `
    <p class="titulo-seccion text-success mb-2">Ajustar stock</p>
    <span class="agro-label">Tipo de movimiento</span>
    <div class="pastillas">
      <input type="radio" name="movimiento" id="s-entrada" value="entrada" checked>
      <label for="s-entrada">Entrada</label>
      <input type="radio" name="movimiento" id="s-salida" value="salida">
      <label for="s-salida">Salida</label>
    </div>
    <span class="agro-label">Cantidad</span>
    <div class="contador" data-unidad="${textoSeguro(elegido.unidad)}">
      <button type="button" aria-label="Restar">-</button>
      <span>5 ${textoSeguro(elegido.unidad)}</span>
      <button type="button" aria-label="Sumar">+</button>
      <input type="hidden" name="cantidad" value="5">
    </div>
    <label for="motivo" class="agro-label">Motivo</label>
    <input type="text" id="motivo" name="motivo" class="agro-input" placeholder="Ej. Compra a proveedor">
    <button type="submit" class="btn-agro-primary">Actualizar stock</button>`;

  let paneles = formulario.querySelectorAll("details");
  let abierto = formulario.querySelector("details[open]");
  abierto.appendChild(ajuste);

  for (let i = 0; i < paneles.length; i++) {
    paneles[i].addEventListener("toggle", function () {
      if (paneles[i].open) {
        // solo uno abierto a la vez
        for (let j = 0; j < paneles.length; j++) {
          if (j !== i) {
            paneles[j].open = false;
          }
        }

        let insumo = buscarPorId(lista, Number(paneles[i].dataset.id));
        let contador = ajuste.querySelector(".contador");
        contador.dataset.unidad = insumo.unidad;
        contador.querySelector("span").textContent = contador.querySelector("input").value + " " + insumo.unidad;
        paneles[i].appendChild(ajuste);
      }
    });
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let panel = ajuste.parentElement;
    let tipo = formulario.querySelector('input[name="movimiento"]:checked').value;
    let cantidad = Number(formulario.elements["cantidad"].value);
    let motivo = document.getElementById("motivo").value.trim();

    if (moverStock(Number(panel.dataset.id), tipo, cantidad, motivo)) {
      window.location.href = "insumos.html?mensaje=guardado";
    }
  });
}

// ================== USO DE INSUMO ==================
function activarUsoInsumo() {
  let formulario = document.getElementById("formUsoInsumo");

  if (formulario === null) {
    return;
  }

  let lista = insumosHabilitados();
  let selectInsumo = document.getElementById("insumo");
  llenarSelect(selectInsumo, lista.map(function (i) { return i.nombre; }));
  llenarSelect(document.getElementById("cultivo"), nombresDeCultivos());

  // al elegir el insumo se pone su unidad
  selectInsumo.addEventListener("change", function () {
    document.getElementById("unidad").value = insumoPorNombre(lista, selectInsumo.value).unidad;
  });

  document.getElementById("fecha").value = fechaDeHoy(0);

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let nombreInsumo = selectInsumo.value;
    let cultivo = document.getElementById("cultivo").value;
    let cantidad = Number(document.getElementById("cantidad").value);
    let fecha = document.getElementById("fecha").value;

    if (nombreInsumo === "" || cultivo === "") {
      alert("Selecciona el insumo y el cultivo");
      return;
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Escribe cuánto usaste del insumo");
      return;
    }

    if (fecha === "" || fecha > fechaDeHoy(0)) {
      alert("Elige una fecha de uso válida (no puede ser después de hoy)");
      return;
    }

    let insumo = insumoPorNombre(lista, nombreInsumo);

    // primero se descuenta del stock; si no alcanza no se registra el uso
    if (moverStock(insumo.id, "salida", cantidad, "uso en " + cultivo) === false) {
      return;
    }

    let usos = obtenerUsosInsumos();
    usos.unshift({
      id: nuevoId(usos),
      insumo: nombreInsumo,
      cultivo: cultivo,
      cantidad: cantidad,
      unidad: document.getElementById("unidad").value.trim() || insumo.unidad,
      fecha: fecha,
      observaciones: document.getElementById("observaciones").value.trim()
    });
    guardarLista(CLAVE_USOS, usos);

    window.location.href = "insumos.html?mensaje=guardado";
  });
}

// ================== CÓDIGO DE BARRAS ==================
function activarCodigoBarras() {
  let formulario = document.getElementById("formCodigo");

  if (formulario === null) {
    return;
  }

  let campo = document.getElementById("codigo");
  let tarjeta = document.getElementById("tarjetaEncontrado");
  let encontrado = null;

  // busca el insumo cada vez que cambia el código
  function buscarCodigo() {
    let codigo = campo.value.trim();
    encontrado = null;

    let lista = insumosHabilitados();
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].codigo === codigo) {
        encontrado = lista[i];
      }
    }

    if (encontrado === null) {
      tarjeta.classList.add("d-none");
      return;
    }

    tarjeta.innerHTML = `
      <strong class="d-block">${textoSeguro(encontrado.nombre)}</strong>
      <span class="texto_gris small d-block">Código: ${textoSeguro(encontrado.codigo)}</span>
      <span class="precio small">Insumo encontrado - ${encontrado.cantidad} ${textoSeguro(encontrado.unidad)} en stock</span>`;
    tarjeta.classList.remove("d-none");

    let contador = formulario.querySelector(".contador");
    contador.dataset.unidad = encontrado.unidad;
    contador.querySelector("span").textContent = contador.querySelector("input").value + " " + encontrado.unidad;
  }

  campo.addEventListener("input", buscarCodigo);
  activarCamara(campo, buscarCodigo);

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (encontrado === null) {
      alert("No hay ningún insumo con ese código");
      return;
    }

    let tipo = formulario.querySelector('input[name="movimiento"]:checked').value;
    let cantidad = Number(formulario.elements["cantidad"].value);

    if (moverStock(encontrado.id, tipo, cantidad, "código de barras")) {
      window.location.href = "insumos.html?mensaje=guardado";
    }
  });
}

// Lee el código con la cámara si el navegador tiene BarcodeDetector (Chrome en Android).
// Si no lo tiene, la persona escribe el código a mano.
function activarCamara(campo, alEncontrar) {
  let caja = document.querySelector(".escaner");

  caja.style.cursor = "pointer";
  caja.addEventListener("click", async function () {
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices) {
      alert("Tu navegador no puede leer códigos con la cámara. Escribe el código a mano.");
      campo.focus();
      return;
    }

    try {
      let video = document.createElement("video");
      video.setAttribute("playsinline", "");
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      video.style.borderRadius = "16px";

      let camara = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.srcObject = camara;
      caja.innerHTML = "";
      caja.appendChild(video);
      await video.play();

      let detector = new BarcodeDetector();
      let revisar = setInterval(async function () {
        let codigos = await detector.detect(video);

        if (codigos.length > 0) {
          clearInterval(revisar);
          camara.getTracks().forEach(function (pista) { pista.stop(); });
          caja.innerHTML = '<i class="bi bi-check-circle"></i><span class="small">Código leído</span>';
          campo.value = codigos[0].rawValue;
          alEncontrar();
        }
      }, 500);
    } catch (error) {
      alert("No se pudo abrir la cámara. Revisa los permisos o escribe el código a mano.");
    }
  });
}

// ================== CATÁLOGO ==================
function mostrarCatalogo() {
  if (document.title.indexOf("Catálogo") !== 0) {
    return;
  }

  let lista = insumosHabilitados();
  let html = "";

  for (let i = 0; i < lista.length; i++) {
    let insumo = lista[i];
    let bajo = porAgotarse(insumo);
    html += `
      <div class="tarjeta p-3 rounded-4 d-flex justify-content-between align-items-center item-buscable">
        <div class="d-flex align-items-center gap-3">
          <span class="punto-insumo punto-insumo--${bajo ? "rojo" : colorDelPunto(i)}"></span>
          <div>
            <strong class="d-block">${textoSeguro(insumo.nombre)}</strong>
            <span class="${bajo ? "texto-bajo-stock" : "texto_gris"} small">${textoSeguro(insumo.categoria)} · ${bajo ? "Bajo stock" : "Inventario"}</span>
          </div>
        </div>
        <div class="text-end">
          <strong class="d-block">${insumo.cantidad} ${textoSeguro(insumo.unidad)}</strong>
          <span class="precio small">${pesos(insumo.cantidad * insumo.precio)}</span>
        </div>
      </div>`;
  }

  document.getElementById("listaPrincipal").innerHTML = html;
}

// ================== COSTOS Y USOS ==================
// Costo de un uso = cantidad usada x precio por unidad del insumo
function costoDelUso(uso, insumos) {
  let insumo = insumoPorNombre(insumos, uso.insumo);
  return insumo === null ? 0 : uso.cantidad * insumo.precio;
}

function filaSimple(nombre, detalle, derecha, color) {
  return `
    <div class="tarjeta p-3 rounded-4 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-3">
        <span class="punto-insumo punto-insumo--${color}"></span>
        <div>
          <strong class="d-block">${textoSeguro(nombre)}</strong>
          <span class="texto_gris small">${textoSeguro(detalle)}</span>
        </div>
      </div>
      ${derecha}
    </div>`;
}

function mostrarCostosPorInsumo() {
  if (document.title.indexOf("Costos por insumo") !== 0) {
    return;
  }

  let insumos = obtenerInsumos();
  let mes = fechaDeHoy(0).slice(0, 7);
  let usos = obtenerUsosInsumos().filter(function (u) { return u.fecha.slice(0, 7) === mes; });
  let costos = {};
  let total = 0;

  for (let i = 0; i < usos.length; i++) {
    let costo = costoDelUso(usos[i], insumos);
    costos[usos[i].insumo] = (costos[usos[i].insumo] || 0) + costo;
    total += costo;
  }

  let html = "";
  let posicion = 0;
  for (let nombre in costos) {
    html += filaSimple(nombre, "Individual", `<span class="precio">${pesos(costos[nombre])}</span>`, colorDelPunto(posicion));
    posicion++;
  }

  ponerTexto("montoTotal", pesos(total));
  document.getElementById("listaPrincipal").innerHTML = html || '<p class="texto_gris">No hay usos registrados este mes.</p>';
}

// Botones de siembra (Maíz - Lote 1, Café - Lote 2...) de "por siembra"
function crearBotonesSiembra(alElegir) {
  let caja = document.getElementById("pillsSiembra");
  let nombres = nombresDeCultivos();
  let html = "";

  for (let i = 0; i < nombres.length; i++) {
    html += `
      <input type="radio" name="siembra" id="siembra-${i}" value="${textoSeguro(nombres[i])}"${i === 0 ? " checked" : ""}>
      <label for="siembra-${i}">${textoSeguro(nombres[i])}</label>`;
  }

  caja.innerHTML = html;
  caja.addEventListener("change", function (evento) {
    alElegir(evento.target.value);
  });

  if (nombres.length > 0) {
    alElegir(nombres[0]);
  }
}

function mostrarCostosPorSiembra() {
  if (document.title.indexOf("Costos por siembra") !== 0) {
    return;
  }

  let insumos = obtenerInsumos();

  crearBotonesSiembra(function (cultivo) {
    let usos = obtenerUsosInsumos().filter(function (u) { return u.cultivo === cultivo; });
    let total = 0;
    let html = "";

    for (let i = 0; i < usos.length; i++) {
      let costo = costoDelUso(usos[i], insumos);
      total += costo;
      html += filaSimple(usos[i].insumo, usos[i].cantidad + " " + usos[i].unidad, `<span class="precio">${pesos(costo)}</span>`, colorDelPunto(i));
    }

    ponerTexto("montoTotal", pesos(total));
    ponerTexto("cantidadRegistros", usos.length + " insumos registrados");
    document.getElementById("listaPrincipal").innerHTML = html || '<p class="texto_gris">Esta siembra no tiene insumos usados.</p>';
  });
}

function mostrarInsumosPorSiembra() {
  if (document.title.indexOf("Insumos por siembra") !== 0) {
    return;
  }

  let insumos = obtenerInsumos();

  crearBotonesSiembra(function (cultivo) {
    let usos = obtenerUsosInsumos().filter(function (u) { return u.cultivo === cultivo; });
    let nombres = [];
    let cantidadTotal = 0;
    let agotarse = 0;
    let html = "";

    for (let i = 0; i < usos.length; i++) {
      cantidadTotal += usos[i].cantidad;

      if (!nombres.includes(usos[i].insumo)) {
        nombres.push(usos[i].insumo);
        let insumo = insumoPorNombre(insumos, usos[i].insumo);
        if (insumo !== null && porAgotarse(insumo)) {
          agotarse++;
        }
      }

      html += `
        <details class="insumo-desplegable">
          <summary>
            <div class="d-flex align-items-center gap-3">
              <span class="punto-insumo punto-insumo--${colorDelPunto(i)}"></span>
              <div>
                <strong class="d-block">${textoSeguro(usos[i].insumo)}</strong>
                <span class="texto_gris small">${textoSeguro(usos[i].observaciones || "Sin observaciones")}</span>
              </div>
            </div>
            <i class="bi bi-chevron-down"></i>
          </summary>
          <div class="descripcion">Se usaron ${usos[i].cantidad} ${textoSeguro(usos[i].unidad)} el ${fechaBonita(usos[i].fecha)}.</div>
        </details>`;
    }

    ponerTexto("dato1", nombres.length);
    ponerTexto("dato2", cantidadTotal);
    ponerTexto("dato3", agotarse);
    ponerTexto("tituloSiembra", "Insumos - " + cultivo);
    document.getElementById("listaPrincipal").innerHTML = html || '<p class="texto_gris">Esta siembra no tiene insumos usados.</p>';
  });
}

function mostrarInsumosUsados() {
  if (document.title.indexOf("Insumos usados") !== 0) {
    return;
  }

  // se suman los usos del mismo insumo en el mismo cultivo
  let usos = obtenerUsosInsumos();
  let grupos = {};

  for (let i = 0; i < usos.length; i++) {
    let llave = usos[i].insumo + "|" + usos[i].cultivo;

    if (grupos[llave] === undefined) {
      grupos[llave] = { insumo: usos[i].insumo, cultivo: usos[i].cultivo, cantidad: 0, unidad: usos[i].unidad };
    }
    grupos[llave].cantidad += usos[i].cantidad;
  }

  let html = "";
  let posicion = 0;
  for (let llave in grupos) {
    let g = grupos[llave];
    html += filaSimple(g.insumo, g.cultivo, `<strong class="small">${g.cantidad} ${textoSeguro(g.unidad)}</strong>`, colorDelPunto(posicion));
    posicion++;
  }

  document.getElementById("listaPrincipal").innerHTML = html || '<p class="texto_gris">Todavía no se ha usado ningún insumo.</p>';
}

// ================== GRÁFICA ==================
function mostrarGrafica() {
  let barras = document.getElementById("graficaBarras");

  if (barras === null) {
    return;
  }

  // cantidad usada de cada insumo en los últimos 30 días
  let desde = fechaDeHoy(30);
  let usos = obtenerUsosInsumos().filter(function (u) { return u.fecha >= desde; });
  let totales = {};

  for (let i = 0; i < usos.length; i++) {
    totales[usos[i].insumo] = (totales[usos[i].insumo] || 0) + usos[i].cantidad;
  }

  let nombres = Object.keys(totales);
  let mayor = Math.max.apply(null, Object.values(totales).concat([1]));
  let htmlBarras = "";
  let htmlEtiquetas = "";

  for (let i = 0; i < nombres.length; i++) {
    let alto = Math.round((totales[nombres[i]] / mayor) * 90);
    htmlBarras += `
      <div class="barra-col" title="${textoSeguro(nombres[i])}: ${totales[nombres[i]]}">
        <span class="valor">${totales[nombres[i]]}</span>
        <div class="barra barra--${colorDelPunto(i)}" style="height: ${alto}%;"></div>
      </div>`;
    // en la etiqueta va solo la primera palabra para que quepa
    htmlEtiquetas += `<span>${textoSeguro(nombres[i].split(" ")[0])}</span>`;
  }

  barras.innerHTML = htmlBarras || '<p class="texto_gris small m-auto">No hay usos en el último mes.</p>';
  document.getElementById("graficaEtiquetas").innerHTML = htmlEtiquetas;
}

// ================== PROVEEDORES ==================
function mostrarProveedores() {
  if (document.title.indexOf("Proveedores de insumo") !== 0) {
    return;
  }

  let lista = obtenerProveedores();
  let html = "";

  for (let i = 0; i < lista.length; i++) {
    let p = lista[i];
    let contacto = "Tel: " + (p.telefono || "----") + "\nCorreo: " + (p.correo || "----") + "\nInsumos: " + p.insumos;
    html += filaSimple(p.nombre, p.insumos, `<a href="#" class="link-editar boton-ver" data-contacto="${textoSeguro(contacto)}">Ver</a>`, "azul");
  }

  let contenedor = document.getElementById("listaPrincipal");
  contenedor.innerHTML = html;

  // "Ver" muestra los datos de contacto del proveedor
  contenedor.addEventListener("click", function (evento) {
    let boton = evento.target.closest(".boton-ver");

    if (boton !== null) {
      evento.preventDefault();
      alert(boton.dataset.contacto);
    }
  });
}

function activarFormularioProveedor() {
  let formulario = document.getElementById("formProveedor");

  if (formulario === null) {
    return;
  }

  let selectInsumo = document.getElementById("insumo");
  if (selectInsumo !== null) {
    llenarSelect(selectInsumo, insumosHabilitados().map(function (i) { return i.nombre; }));
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let nombre = document.getElementById("proveedor").value.trim();
    let telefono = document.getElementById("telefono");
    let correo = document.getElementById("correo");
    let insumos = selectInsumo !== null ? selectInsumo.value : document.getElementById("entregados").value.trim();

    if (nombre.length < 3) {
      alert("El nombre del proveedor debe tener mínimo 3 letras");
      return;
    }

    if (telefono !== null && telefono.value.replace(/\D/g, "").length < 7) {
      alert("Escribe un teléfono válido, por ejemplo 310 000 0000");
      return;
    }

    if (correo !== null && correoValido(correo.value.trim()) === false) {
      alert("Escribe un correo válido, por ejemplo contacto@agro.com");
      return;
    }

    if (insumos === "") {
      alert("Indica qué insumo entrega el proveedor");
      return;
    }

    let lista = obtenerProveedores();
    lista.push({
      id: nuevoId(lista),
      nombre: nombre,
      telefono: telefono !== null ? telefono.value.trim() : "",
      correo: correo !== null ? correo.value.trim() : "",
      insumos: insumos,
      llegada: document.getElementById("llegada") !== null ? document.getElementById("llegada").value : ""
    });

    guardarLista(CLAVE_PROVEEDORES, lista);
    registrarEvento("Proveedor registrado", nombre, "insumos", "bi-truck", "success");
    window.location.href = "proveedores-insumos.html?mensaje=guardado";
  });
}

// ================== HISTORIAL DE USO ==================
function mostrarHistorialInsumos() {
  if (document.title.indexOf("Historial uso") !== 0) {
    return;
  }

  let usos = obtenerUsosInsumos();
  let insumos = obtenerInsumos();
  let html = "";

  // un renglón por cada insumo, con el último cultivo donde se usó
  for (let i = 0; i < insumos.length; i++) {
    let ultimo = null;
    for (let j = 0; j < usos.length; j++) {
      if (usos[j].insumo === insumos[i].nombre && (ultimo === null || usos[j].fecha > ultimo.fecha)) {
        ultimo = usos[j];
      }
    }

    html += `
      <a href="historial-uso.html?id=${insumos[i].id}" class="tarjeta p-3 rounded-4 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <span class="punto-insumo punto-insumo--${ultimo === null ? "gris" : "verde"}"></span>
          <div>
            <strong class="d-block">${textoSeguro(insumos[i].nombre)}</strong>
            <span class="texto_gris small">${ultimo === null ? "Sin asociar" : textoSeguro(ultimo.cultivo)}</span>
          </div>
        </div>
        <i class="bi bi-chevron-right text-success"></i>
      </a>`;
  }

  document.getElementById("listaPrincipal").innerHTML = html;
}

function mostrarHistorialDeUnInsumo() {
  if (document.getElementById("tituloPagina") === null) {
    return;
  }

  let insumos = obtenerInsumos();
  let insumo = buscarPorId(insumos, idDeLaDireccion()) || insumos[0];
  let usos = obtenerUsosInsumos().filter(function (u) { return u.insumo === insumo.nombre; });
  let meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  let html = "";

  usos.sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });

  for (let i = 0; i < usos.length; i++) {
    let p = usos[i].fecha.split("-");
    let fecha = p[2] + " " + meses[Number(p[1]) - 1] + " " + p[0];
    html += filaSimple(fecha, usos[i].cultivo, `<strong class="small">${usos[i].cantidad} ${textoSeguro(usos[i].unidad)}</strong>`, "verde");
  }

  ponerTexto("tituloPagina", "Historial de uso - " + insumo.nombre);
  document.getElementById("listaPrincipal").innerHTML = html || '<p class="texto_gris">Este insumo todavía no se ha usado.</p>';
}

// Primero se dibujan las pantallas y después se activan los botones
mostrarInventario();
activarCrearInsumo();
activarEditarInsumo();
activarInhabilitarInsumo();
activarActualizarStock();
activarUsoInsumo();
activarCodigoBarras();
mostrarCatalogo();
mostrarCostosPorInsumo();
mostrarCostosPorSiembra();
mostrarInsumosPorSiembra();
mostrarInsumosUsados();
mostrarGrafica();
mostrarProveedores();
activarFormularioProveedor();
mostrarHistorialInsumos();
mostrarHistorialDeUnInsumo();
activarContadores();
activarBuscador();
