function aviso() {
    alert("Bienvenido al mundo JavaScript");
}

function confirmacion() {
    const respuesta = confirm("¿Desea salir de la sesión?");
    alert(`Valor seleccionado: ${respuesta}`);
}

function capturarDatos() {
    const nombre = prompt("¿Cuál es su nombre?");
    if (nombre === null) return;

    const edad = prompt("¿Cuál es su edad?", "0");
    if (edad === null) return;

    alert(`Su nombre es ${nombre} y su edad es ${edad}`);
}

function dibujarParrafo() {
    const texto = prompt("Escriba la información que desea visualizar en el párrafo");
    if (texto === null) return;

    document.querySelector("#idParrafo").textContent = texto;
}

document.querySelector("#idBtnAlert").addEventListener("click", aviso);
document.querySelector("#idBtnPrompt").addEventListener("click", capturarDatos);
document.querySelector("#idBtnConfirm").addEventListener("click", confirmacion);
document.querySelector("#idBtnParrafo").addEventListener("click", dibujarParrafo);
