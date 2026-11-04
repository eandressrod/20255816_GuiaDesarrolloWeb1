const estudiantes = [];
const formularioEstudiante = document.querySelector("#idFormEstudiante");
const contenedorEstudiantes = document.querySelector("#idContainerEstudiantes");
const mensajeEstudiante = document.querySelector("#idMensaje");

formularioEstudiante.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const carnet = document.querySelector("#inputCarnet").value.trim().toUpperCase();
    const nombres = document.querySelector("#inputNombre").value.trim();
    const apellidos = document.querySelector("#inputApellidos").value.trim();

    if (!carnet || !nombres || !apellidos) {
        mensajeEstudiante.textContent = "Completa todos los campos.";
        mensajeEstudiante.className = "small mt-3 mb-0 text-danger";
        return;
    }

    estudiantes.push([carnet, nombres, apellidos]);
    formularioEstudiante.reset();
    document.querySelector("#inputCarnet").focus();
    mensajeEstudiante.textContent = "Estudiante registrado.";
    mensajeEstudiante.className = "small mt-3 mb-0 text-success";
});

document.querySelector("#idBtnMostrarEstudiantes").addEventListener("click", mostrarEstudiantes);

function mostrarEstudiantes() {
    if (estudiantes.length === 0) {
        contenedorEstudiantes.textContent = "No se han registrado estudiantes.";
        return;
    }

    const tabla = document.createElement("table");
    tabla.className = "table table-light table-striped table-bordered align-middle mb-0";
    const encabezado = tabla.createTHead().insertRow();
    ["#", "Carnet", "Nombres", "Apellidos"].forEach((titulo) => {
        const celda = document.createElement("th");
        celda.scope = "col";
        celda.textContent = titulo;
        encabezado.append(celda);
    });

    const cuerpo = tabla.createTBody();
    estudiantes.forEach((estudiante, indice) => {
        const fila = cuerpo.insertRow();
        [String(indice + 1), ...estudiante].forEach((dato) => {
            const celda = fila.insertCell();
            celda.textContent = dato;
        });
    });

    contenedorEstudiantes.replaceChildren(tabla);
}
