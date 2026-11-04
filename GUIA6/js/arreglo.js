const valores = [];
const formularioArreglo = document.querySelector("#idFormArreglo");
const contenedorArreglo = document.querySelector("#idContainerArreglo");
const contenedorOrdenado = document.querySelector("#idContainerArregloOrdenado");

formularioArreglo.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const campoNumero = document.querySelector("#inputNumero");
    const numero = Number(campoNumero.value);

    if (campoNumero.value.trim() === "" || !Number.isFinite(numero)) {
        alert("Ingresa un número válido.");
        return;
    }

    valores.push(numero);
    campoNumero.value = "";
    campoNumero.focus();
    mostrarValores(contenedorArreglo, valores);
    contenedorOrdenado.textContent = "Presiona Ordenar para ver los valores ordenados.";
});

document.querySelector("#idBtnOrdenar").addEventListener("click", () => {
    if (valores.length === 0) {
        contenedorOrdenado.textContent = "Agrega al menos un número.";
        return;
    }
    const valoresOrdenados = [...valores].sort((a, b) => a - b);
    mostrarValores(contenedorOrdenado, valoresOrdenados);
});

function mostrarValores(contenedor, arreglo) {
    const fragmento = document.createDocumentFragment();
    arreglo.forEach((valor) => {
        const elemento = document.createElement("span");
        elemento.className = "number-badge";
        elemento.textContent = String(valor);
        fragmento.append(elemento);
    });
    contenedor.replaceChildren(fragmento);
}
