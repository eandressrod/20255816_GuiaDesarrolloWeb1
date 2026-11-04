const resultadoTablaFunciones = document.querySelector("#idDivResultado");
const mensajeTablaFunciones = document.querySelector("#idMensajeTabla");
const modalTabla = bootstrap.Modal.getOrCreateInstance(document.querySelector("#idModal"));

document.querySelector("#idBtnCrearTabla").addEventListener("click", () => {
    const filas = Number(document.querySelector("#idNumFila").value);
    const columnas = Number(document.querySelector("#idNumColumnas").value);

    if (!Number.isInteger(filas) || !Number.isInteger(columnas)
        || filas < 1 || filas > 30 || columnas < 1 || columnas > 20) {
        mensajeTablaFunciones.textContent = "Ingresa entre 1 y 30 filas y entre 1 y 20 columnas.";
        return;
    }

    mensajeTablaFunciones.textContent = "";
    resultadoTablaFunciones.replaceChildren(generarTabla(filas, columnas));
    modalTabla.hide();
});

function generarFila(tipo, fila, columnas) {
    const elementoFila = document.createElement("tr");

    for (let columna = 0; columna <= columnas; columna++) {
        const esEncabezado = tipo === "encabezado" || columna === 0;
        const celda = document.createElement(esEncabezado ? "th" : "td");
        if (esEncabezado) {
            celda.scope = columna === 0 ? "row" : "col";
        }

        if (tipo === "encabezado") {
            celda.textContent = columna === 0 ? "#" : "Título " + columna;
        } else if (columna === 0) {
            celda.textContent = "Fila " + fila;
        } else {
            celda.textContent = "Celda " + fila + ", " + columna;
        }
        elementoFila.append(celda);
    }

    return elementoFila;
}

function generarTabla(filas, columnas) {
    const tabla = document.createElement("table");
    tabla.className = "table table-striped table-hover table-bordered function-table";
    const encabezado = tabla.createTHead();
    encabezado.append(generarFila("encabezado", 0, columnas));
    const cuerpo = tabla.createTBody();

    for (let fila = 1; fila <= filas; fila++) {
        cuerpo.append(generarFila("cuerpo", fila, columnas));
    }

    return tabla;
}
