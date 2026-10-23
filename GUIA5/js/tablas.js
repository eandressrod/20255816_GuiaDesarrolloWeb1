const alumnos = [
    { id: 1, nombre: "Marcos Antonio", apellido: "Alas", correo: "marcos.alas@estudiante.esen.edu.sv" },
    { id: 2, nombre: "Ana Paola", apellido: "Rivas Polanco", correo: "paola.rivas@estudiante.esen.edu.sv" },
    { id: 3, nombre: "Alexis Armando", apellido: "Quintanilla Peña", correo: "alexis.quintanilla@estudiante.esen.edu.sv" },
    { id: 4, nombre: "Vanessa Alejandra", apellido: "Bermudez Urquilla", correo: "vanessa.bermudez@estudiante.esen.edu.sv" },
    { id: 5, nombre: "Oscar Armando", apellido: "López Rodriguez", correo: "oscar.lopez@estudiante.esen.edu.sv" }
];

let tabla = "<table>";
tabla += "<thead><tr>";
tabla += "<th scope='col'>#</th>";
tabla += "<th scope='col'>Nombre</th>";
tabla += "<th scope='col'>Apellido</th>";
tabla += "<th scope='col'>Correo electrónico</th>";
tabla += "</tr></thead><tbody>";

alumnos.forEach(alumno => {
    tabla += "<tr>";
    tabla += `<th scope='row'>${alumno.id}</th>`;
    tabla += `<td>${alumno.nombre}</td>`;
    tabla += `<td>${alumno.apellido}</td>`;
    tabla += `<td>${alumno.correo}</td>`;
    tabla += "</tr>";
});

tabla += "</tbody></table>";
document.querySelector("#idContenedor").innerHTML = tabla;
