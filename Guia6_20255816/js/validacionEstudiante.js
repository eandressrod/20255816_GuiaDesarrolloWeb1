// Referencias a los elementos del formulario
const formEstudiante = document.getElementById("idFormEstudiante");
const resultado = document.getElementById("idResultado");

// Expresiones regulares para cada campo
const regexCarnet = /^[A-Z]{2}\d{3}$/i;
const regexNombre = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/;
const regexDui = /^\d{8}-\d$/;
const regexNit = /^\d{4}-\d{6}-\d{3}-\d$/;
const regexFecha = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const regexCorreo = /^[\w.+-]+@[\w-]+(\.[\w-]+)*\.[A-Za-z]{2,}$/;
const regexEdad = /^\d+$/;

// La expresion regular revisa el formato DD/MM/AAAA,
// pero tambien se comprueba que la fecha exista (por ejemplo, 31/02 no existe)
const fechaValida = function (texto) {
    const partes = texto.match(regexFecha);
    if (!partes) {
        return false;
    }

    const dia = Number(partes[1]);
    const mes = Number(partes[2]);
    const anio = Number(partes[3]);
    const fecha = new Date(anio, mes - 1, dia);

    return fecha.getFullYear() === anio
        && fecha.getMonth() === mes - 1
        && fecha.getDate() === dia
        && fecha <= new Date();
};

// Cada campo con su forma de validarlo y el mensaje de error
const validaciones = [
    { id: "idCarnet", validar: (v) => regexCarnet.test(v), mensaje: "Dos letras y tres números, por ejemplo AB001." },
    { id: "idNombre", validar: (v) => regexNombre.test(v), mensaje: "Solo letras, con al menos un nombre y un apellido." },
    { id: "idDui", validar: (v) => regexDui.test(v), mensaje: "Use el formato ########-#." },
    { id: "idNit", validar: (v) => regexNit.test(v), mensaje: "Use el formato ####-######-###-#." },
    { id: "idFecha", validar: fechaValida, mensaje: "Escriba una fecha real con el formato DD/MM/AAAA." },
    { id: "idCorreo", validar: (v) => regexCorreo.test(v), mensaje: "Escriba un correo válido, por ejemplo nombre@correo.com." },
    { id: "idEdad", validar: (v) => regexEdad.test(v), mensaje: "La edad debe contener solo números." }
];

// Marca o desmarca un campo segun el resultado de su validacion
const marcarCampo = function (campo, valido, mensaje) {
    const error = document.getElementById(`${campo.id}Error`);
    campo.classList.toggle("invalido", !valido);
    campo.classList.toggle("valido", valido);
    error.textContent = valido ? "" : mensaje;
};

formEstudiante.addEventListener("submit", function (e) {
    e.preventDefault();

    let fichaValida = true;
    for (const validacion of validaciones) {
        const campo = document.getElementById(validacion.id);
        const valor = campo.value.trim();
        const valido = valor !== "" && validacion.validar(valor);

        marcarCampo(campo, valido, valor === "" ? "Este campo es obligatorio." : validacion.mensaje);
        fichaValida = fichaValida && valido;
    }

    resultado.className = fichaValida ? "resultado correcto" : "resultado incorrecto";
    resultado.textContent = fichaValida
        ? "La ficha es válida. Todos los campos cumplen su formato."
        : "Revise los campos marcados en rojo.";
});

formEstudiante.addEventListener("reset", function () {
    for (const validacion of validaciones) {
        const campo = document.getElementById(validacion.id);
        marcarCampo(campo, true, "");
        campo.classList.remove("valido");
    }
    resultado.className = "resultado";
    resultado.textContent = "";
});
