const formularioPromedio = document.querySelector("#idFormPromedio");
const resultadoPromedio = document.querySelector("#idContainerEstudiantes");

formularioPromedio.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const total = Number(document.querySelector("#inputNumeroEstudiantes").value);

    if (!Number.isInteger(total) || total < 1 || total > 30) {
        resultadoPromedio.textContent = "Ingresa un número entero entre 1 y 30.";
        return;
    }

    const estudiantes = [];
    let contador = 1;
    while (contador <= total) {
        const nombreIngresado = prompt("Nombre del estudiante " + contador + ":");
        if (nombreIngresado === null) {
            resultadoPromedio.textContent = "Registro cancelado.";
            return;
        }
        const nombre = nombreIngresado.trim();
        if (!nombre) {
            alert("El nombre no puede quedar vacío.");
            continue;
        }

        let nota;
        let notaValida = false;
        while (!notaValida) {
            const respuesta = prompt("Nota de " + nombre + " (de 0 a 10):");
            if (respuesta === null) {
                resultadoPromedio.textContent = "Registro cancelado.";
                return;
            }
            nota = Number(respuesta);
            if (respuesta.trim() !== "" && Number.isFinite(nota) && nota >= 0 && nota <= 10) {
                notaValida = true;
            } else {
                alert("Ingresa una nota entre 0 y 10.");
            }
        }

        estudiantes.push([nombre, nota]);
        contador++;
    }

    let suma = 0;
    let mejorEstudiante = estudiantes[0];
    const lista = document.createElement("ol");
    lista.className = "mb-3";

    estudiantes.forEach((estudiante) => {
        suma += estudiante[1];
        if (estudiante[1] > mejorEstudiante[1]) {
            mejorEstudiante = estudiante;
        }
        const elemento = document.createElement("li");
        elemento.textContent = estudiante[0] + " — Calificación: " + estudiante[1].toFixed(2);
        lista.append(elemento);
    });

    const promedio = document.createElement("p");
    promedio.className = "fw-bold mb-1";
    promedio.textContent = "Promedio de calificaciones: " + (suma / estudiantes.length).toFixed(2);
    const mejor = document.createElement("p");
    mejor.className = "fw-bold mb-0";
    mejor.textContent = "Estudiante con mejor calificación: " + mejorEstudiante[0];
    resultadoPromedio.replaceChildren(lista, promedio, mejor);
});
