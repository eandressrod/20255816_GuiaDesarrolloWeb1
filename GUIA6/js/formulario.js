const formularioPaciente = document.querySelector("#idForm");
const tablaPacientes = document.querySelector("#idTablaPacientes");
const botonGuardarPaciente = document.querySelector("#idBtnAgregar");
const campoNombrePais = document.querySelector("#idNombrePais");
const selectorPais = document.querySelector("#idCmbPais");
const toastPaciente = bootstrap.Toast.getOrCreateInstance(document.querySelector("#idNotificacion"));
const clavePacientes = "guia6-pacientes";
let arrayPaciente = cargarPacientes();
let indiceEdicion = -1;

function cargarPacientes() {
    try {
        const guardados = JSON.parse(localStorage.getItem(clavePacientes) || "[]");
        return Array.isArray(guardados) ? guardados : [];
    } catch {
        return [];
    }
}

function guardarPacientes() {
    try {
        localStorage.setItem(clavePacientes, JSON.stringify(arrayPaciente));
        return true;
    } catch {
        return false;
    }
}

function notificar(mensaje, exito = true) {
    const toast = document.querySelector("#idNotificacion");
    const cuerpo = document.querySelector("#idMensaje");
    toast.classList.toggle("text-bg-success", exito);
    toast.classList.toggle("text-bg-danger", !exito);
    cuerpo.textContent = mensaje;
    toastPaciente.show();
}

function limpiarFormulario() {
    formularioPaciente.reset();
    indiceEdicion = -1;
    botonGuardarPaciente.textContent = "Guardar datos";
}

function agregarPais(nombre) {
    const opcion = document.createElement("option");
    opcion.value = nombre;
    opcion.textContent = nombre;
    selectorPais.append(opcion);
}

function imprimirPacientes() {
    if (arrayPaciente.length === 0) {
        tablaPacientes.textContent = "Ninguno";
        return;
    }

    const tabla = document.createElement("table");
    tabla.className = "table table-striped table-hover table-bordered align-middle mb-0";
    const encabezado = tabla.createTHead().insertRow();
    ["#", "Nombre", "Apellido", "Fecha de nacimiento", "Sexo", "País", "Dirección", "Opciones"].forEach((titulo) => {
        const celda = document.createElement("th");
        celda.scope = "col";
        celda.textContent = titulo;
        encabezado.append(celda);
    });

    const cuerpo = tabla.createTBody();
    arrayPaciente.forEach((paciente, indice) => {
        const fila = cuerpo.insertRow();
        [String(indice + 1), paciente.nombre, paciente.apellido, paciente.fechaNacimiento,
            paciente.sexo, paciente.pais, paciente.direccion].forEach((dato) => {
            fila.insertCell().textContent = dato;
        });

        const opciones = fila.insertCell();
        const editar = document.createElement("button");
        editar.type = "button";
        editar.className = "btn btn-sm btn-primary me-1";
        editar.dataset.accion = "editar";
        editar.dataset.indice = String(indice);
        editar.textContent = "Editar";
        editar.setAttribute("aria-label", "Editar a " + paciente.nombre);

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.className = "btn btn-sm btn-danger";
        eliminar.dataset.accion = "eliminar";
        eliminar.dataset.indice = String(indice);
        eliminar.textContent = "Eliminar";
        eliminar.setAttribute("aria-label", "Eliminar a " + paciente.nombre);
        opciones.append(editar, eliminar);
    });

    tablaPacientes.replaceChildren(tabla);
}

function editarPaciente(indice) {
    const paciente = arrayPaciente[indice];
    if (!paciente) {
        return;
    }

    document.querySelector("#idTxtNombre").value = paciente.nombre;
    document.querySelector("#idTxtApellido").value = paciente.apellido;
    document.querySelector("#idTxtFechaNacimiento").value = paciente.fechaNacimiento;
    document.querySelector("#idRdMasculino").checked = paciente.sexo === "Hombre";
    document.querySelector("#idRdFemenino").checked = paciente.sexo === "Mujer";
    if (![...selectorPais.options].some((opcion) => opcion.value === paciente.pais)) {
        agregarPais(paciente.pais);
    }
    selectorPais.value = paciente.pais;
    document.querySelector("#idTxtDireccion").value = paciente.direccion;
    indiceEdicion = indice;
    botonGuardarPaciente.textContent = "Guardar cambios";
    document.querySelector("#idTxtNombre").focus();
}

formularioPaciente.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!formularioPaciente.reportValidity()) {
        return;
    }

    const sexo = document.querySelector('input[name="rdSexo"]:checked').value;
    const paciente = {
        nombre: document.querySelector("#idTxtNombre").value.trim(),
        apellido: document.querySelector("#idTxtApellido").value.trim(),
        fechaNacimiento: document.querySelector("#idTxtFechaNacimiento").value,
        sexo,
        pais: selectorPais.value,
        direccion: document.querySelector("#idTxtDireccion").value.trim()
    };

    if (indiceEdicion < 0) {
        arrayPaciente.push(paciente);
    } else {
        arrayPaciente[indiceEdicion] = paciente;
    }

    const guardado = guardarPacientes();
    imprimirPacientes();
    limpiarFormulario();
    notificar(guardado ? "Los datos del paciente se guardaron." : "No se pudo guardar en este navegador.", guardado);
});

document.querySelector("#idBtnLimpiar").addEventListener("click", limpiarFormulario);
document.querySelector("#idBtnMostrar").addEventListener("click", imprimirPacientes);

tablaPacientes.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) {
        return;
    }
    const indice = Number(boton.dataset.indice);

    if (boton.dataset.accion === "editar") {
        editarPaciente(indice);
    } else if (boton.dataset.accion === "eliminar" && confirm("¿Eliminar este paciente?")) {
        arrayPaciente.splice(indice, 1);
        const guardado = guardarPacientes();
        if (indiceEdicion === indice) {
            limpiarFormulario();
        } else if (indiceEdicion > indice) {
            indiceEdicion--;
        }
        imprimirPacientes();
        notificar(guardado ? "Paciente eliminado." : "No se pudo guardar el cambio.", guardado);
    }
});

document.querySelector("#idBtnAddPais").addEventListener("click", () => {
    const nombre = campoNombrePais.value.trim();
    if (!nombre) {
        notificar("Escribe el nombre del país.", false);
        return;
    }

    const repetido = [...selectorPais.options].some((opcion) =>
        opcion.value.toLocaleLowerCase("es") === nombre.toLocaleLowerCase("es"));
    if (repetido) {
        notificar("Ese país ya está en la lista.", false);
        return;
    }

    agregarPais(nombre);
    selectorPais.value = nombre;
    campoNombrePais.value = "";
    bootstrap.Modal.getOrCreateInstance(document.querySelector("#idModal")).hide();
    notificar("País agregado.");
});

imprimirPacientes();
