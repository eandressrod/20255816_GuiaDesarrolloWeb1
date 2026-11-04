const formularioValidacion = document.querySelector("#idFormValidacion");
const resultadoValidacion = document.querySelector("#idResultadoValidacion");

function fechaValida(fecha) {
    const partes = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!partes) {
        return false;
    }

    const dia = Number(partes[1]);
    const mes = Number(partes[2]);
    const anio = Number(partes[3]);
    const valorFecha = new Date(0);
    valorFecha.setFullYear(anio, mes - 1, dia);
    return valorFecha.getFullYear() === anio
        && valorFecha.getMonth() === mes - 1
        && valorFecha.getDate() === dia;
}

formularioValidacion.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const validaciones = [
        ["idCarnet", /^[A-Za-z]{2}\d{3}$/],
        ["idNombreCompleto", /^\p{L}+(?:\s+\p{L}+)+$/u],
        ["idDui", /^\d{8}-\d$/],
        ["idNit", /^\d{4}-\d{6}-\d{3}-\d$/],
        ["idFechaNacimiento", fechaValida],
        ["idCorreo", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/],
        ["idEdad", /^\d+$/]
    ];

    let fichaValida = true;
    validaciones.forEach(([id, validador]) => {
        const campo = document.getElementById(id);
        const valor = campo.value.trim();
        const valido = valor !== "" && (validador instanceof RegExp ? validador.test(valor) : validador(valor));
        campo.classList.toggle("is-invalid", !valido);
        campo.classList.toggle("is-valid", valido);
        fichaValida = fichaValida && valido;
    });

    resultadoValidacion.className = fichaValida
        ? "function-result mt-3 mb-0 alert alert-success"
        : "function-result mt-3 mb-0 alert alert-danger";
    resultadoValidacion.textContent = fichaValida
        ? "La ficha es válida."
        : "Revisa los campos marcados.";
});
