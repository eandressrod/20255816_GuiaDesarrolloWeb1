const formularioTabla = document.querySelector("#idFormTabla");
const numeroTabla = document.querySelector("#inputTabla");
const resultadoTabla = document.querySelector("#idContainerResultado");

formularioTabla.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const numero = Number(numeroTabla.value);

    if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
        resultadoTabla.textContent = "Ingresa un número entero entre 1 y 100.";
        return;
    }

    const tabla = document.createElement("table");
    tabla.className = "table table-striped table-bordered text-center";
    const encabezado = tabla.createTHead().insertRow();
    ["Operación", "Resultado"].forEach((titulo) => {
        const celda = document.createElement("th");
        celda.scope = "col";
        celda.textContent = titulo;
        encabezado.append(celda);
    });
    const cuerpo = tabla.createTBody();

    let contador = 1;
    do {
        const fila = cuerpo.insertRow();
        const operacion = fila.insertCell();
        const resultado = fila.insertCell();
        operacion.textContent = numero + " × " + contador;
        resultado.textContent = String(numero * contador);
        contador++;
    } while (contador <= 12);

    resultadoTabla.replaceChildren(tabla);
});
