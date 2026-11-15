// Obteniendo la referencia de los elementos
// por medio de arreglos asociativos
// aqui se esta utilizando el atributo name de cada elemento
const formulario = document.forms["frmRegistro"];
const button = document.forms["frmRegistro"].elements["btnRegistro"];

// CREANDO MODAL CON BOOTSTRAP
const modal = new bootstrap.Modal(document.getElementById("idModal"), {});

// OBTENIENDO LA REFERENCIA DEL CUERPO DEL MODAL
// PARA IMPRIMIR EL RESULTADO
const bodyModal = document.getElementById("idBodyModal");

// REFERENCIAS A LOS CAMPOS DEL FORMULARIO
const nombre = document.getElementById("idNombre");
const apellidos = document.getElementById("idApellidos");
const fechaNac = document.getElementById("idFechaNac");
const correo = document.getElementById("idCorreo");
const password = document.getElementById("idPassword");
const passwordRepetir = document.getElementById("idPasswordRepetir");
const pais = document.getElementById("idCmPais");
const archivo = document.getElementById("idArchivo");
const grupoIntereses = document.getElementById("idGrupoIntereses");
const grupoCarrera = document.getElementById("idGrupoCarrera");

// Expresion regular para validar el correo electronico
const regexCorreo = /^[\w.+-]+@[a-zA-Z\d-]+(\.[a-zA-Z\d-]+)*\.[a-zA-Z]{2,}$/;

// Obtiene el texto del label asociado a un control
const textoLabel = function (elemento) {
    return document.querySelector(`label[for="${elemento.id}"]`).textContent.trim();
};

// Elimina todos los hijos de un nodo usando removeChild
const limpiarNodo = function (nodo) {
    while (nodo.firstChild) {
        nodo.removeChild(nodo.firstChild);
    }
};

// Quita los mensajes de error de una validacion anterior
const limpiarErrores = function () {
    const mensajes = formulario.querySelectorAll(".invalid-feedback");
    for (const mensaje of mensajes) {
        mensaje.parentNode.removeChild(mensaje);
    }

    // Recorriendo los elementos del formulario para quitar la marca de error
    const elementos = formulario.elements;
    for (let index = 0; index < elementos.length; index++) {
        elementos[index].classList.remove("is-invalid");
    }
};

// Crea el mensaje de error debajo del nodo indicado
const crearMensaje = function (nodoReferencia, texto) {
    const mensaje = document.createElement("div");
    mensaje.setAttribute("class", "invalid-feedback d-block");
    mensaje.appendChild(document.createTextNode(texto));
    nodoReferencia.insertAdjacentElement("afterend", mensaje);
};

// Marca un campo como invalido y muestra el mensaje
const marcarCampo = function (campo, texto) {
    campo.classList.add("is-invalid");
    crearMensaje(campo, texto);
};

// Marca un grupo de radio o checkbox como invalido
const marcarGrupo = function (grupo, texto) {
    const opciones = grupo.querySelectorAll("input");
    for (const opcion of opciones) {
        opcion.classList.add("is-invalid");
    }
    const ultimaOpcion = grupo.querySelectorAll(".form-check");
    crearMensaje(ultimaOpcion[ultimaOpcion.length - 1], texto);
};

// Devuelve la fecha actual con el formato AAAA-MM-DD
const fechaActual = function () {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
};

// Validando la informacion del formulario
const validarFormulario = function () {
    limpiarErrores();
    let valido = true;

    // a. Los campos no deben estar vacios
    const camposTexto = [nombre, apellidos, fechaNac, correo, password, passwordRepetir];
    for (const campo of camposTexto) {
        if (campo.value.trim() == "") {
            marcarCampo(campo, `El campo ${textoLabel(campo)} es obligatorio.`);
            valido = false;
        }
    }

    if (archivo.files.length == 0) {
        marcarCampo(archivo, "Seleccione la imagen de su avatar.");
        valido = false;
    }

    // b. La fecha de nacimiento no debe superar la fecha actual
    if (fechaNac.value != "" && fechaNac.value > fechaActual()) {
        marcarCampo(fechaNac, "La fecha de nacimiento no puede ser mayor a la fecha actual.");
        valido = false;
    }

    // c. Validando el correo con una expresion regular
    if (correo.value.trim() != "" && !regexCorreo.test(correo.value.trim())) {
        marcarCampo(correo, "Ingrese un correo electrónico válido, por ejemplo nombre@correo.com.");
        valido = false;
    }

    // d. Las contraseñas deben ser iguales
    if (password.value != "" && passwordRepetir.value != "" && password.value != passwordRepetir.value) {
        marcarCampo(passwordRepetir, "Las contraseñas no coinciden.");
        valido = false;
    }

    // e. Al menos un interes seleccionado
    if (grupoIntereses.querySelectorAll("input:checked").length == 0) {
        marcarGrupo(grupoIntereses, "Seleccione al menos un interés.");
        valido = false;
    }

    // f. Debe seleccionar una carrera
    if (grupoCarrera.querySelectorAll("input:checked").length == 0) {
        marcarGrupo(grupoCarrera, "Seleccione la carrera que estudia.");
        valido = false;
    }

    // g. Debe seleccionar un pais de origen
    if (pais.selectedIndex == 0) {
        marcarCampo(pais, "Seleccione su país de origen.");
        valido = false;
    }

    return valido;
};

// Convierte la fecha AAAA-MM-DD a DD/MM/AAAA
const formatearFecha = function (fecha) {
    const partes = fecha.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

// Recorre el formulario y obtiene la informacion capturada
const obtenerDatos = function () {
    const intereses = [];
    for (const opcion of grupoIntereses.querySelectorAll("input:checked")) {
        intereses.push(textoLabel(opcion));
    }

    return [
        ["Nombres", nombre.value.trim()],
        ["Apellidos", apellidos.value.trim()],
        ["Fecha de nacimiento", formatearFecha(fechaNac.value)],
        ["Correo electrónico", correo.value.trim()],
        ["Contraseña", "*".repeat(password.value.length)],
        ["Intereses", intereses.join(", ")],
        ["Carrera", textoLabel(grupoCarrera.querySelector("input:checked"))],
        ["País de origen", pais.options[pais.selectedIndex].text],
        ["Avatar", archivo.files[0].name]
    ];
};

// Crea una tabla con funciones del DOM, sin innerHTML
const crearTabla = function (datos) {
    const tabla = document.createElement("table");
    tabla.setAttribute("class", "table table-striped table-bordered align-middle mb-0");

    const thead = document.createElement("thead");
    const filaEncabezado = document.createElement("tr");
    for (const encabezado of ["Campo", "Información"]) {
        const th = document.createElement("th");
        th.setAttribute("scope", "col");
        th.appendChild(document.createTextNode(encabezado));
        filaEncabezado.appendChild(th);
    }
    thead.appendChild(filaEncabezado);
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (const [campo, valor] of datos) {
        const fila = document.createElement("tr");

        const th = document.createElement("th");
        th.setAttribute("scope", "row");
        th.appendChild(document.createTextNode(campo));

        const td = document.createElement("td");
        td.appendChild(document.createTextNode(valor));

        fila.appendChild(th);
        fila.appendChild(td);
        tbody.appendChild(fila);
    }
    tabla.appendChild(tbody);

    return tabla;
};

// Muestra la informacion validada en el modal
const mostrarRegistro = function () {
    limpiarNodo(bodyModal);
    bodyModal.appendChild(crearTabla(obtenerDatos()));
    //Funcion que permite mostrar el modal de Bootstrap
    //Esta funcion es definida por Bootstrap
    modal.show();
};

// agregando eventos al boton
button.onclick = () => {
    if (validarFormulario()) {
        mostrarRegistro();
    }
};
