//Accediendo a los elementos html
const inputNombre = document.getElementById("idTxtNombre");
const inputApellido = document.getElementById("idTxtApellido");
const inputFechaNacimiento = document.getElementById("idTxtFechaNacimiento");
const inputRdMasculino = document.getElementById("idRdMasculino");
const inputRdFemenino = document.getElementById("idRdFemenino");
const cmbPais = document.getElementById("idCmbPais");
const inputDireccion = document.getElementById("idTxtDireccion");
const inputNombrePais = document.getElementById("idNombrePais");

const buttonAgregarPaciente = document.getElementById("idBtnAgregar");
const buttonLimpiarPaciente = document.getElementById("idBtnLimpiar");
const buttonMostrarPaciente = document.getElementById("idBtnMostrar");
const buttonAgregarPais = document.getElementById("idBtnAddPais");

const notificacion = document.getElementById("idNotificacion");
// Componente de Bootstrap
const toast = new bootstrap.Toast(notificacion);
const mensaje = document.getElementById("idMensaje");

//Componente modal
const idModal = document.getElementById("idModal");

//Clave con la que se guardan los pacientes en LocalStorage
const clavePacientes = "pacientes";

//Recuperando los pacientes guardados en LocalStorage
const cargarPacientes = () => {
  try {
    const guardados = JSON.parse(localStorage.getItem(clavePacientes));
    return Array.isArray(guardados) ? guardados : [];
  } catch (error) {
    return [];
  }
};

//Guardando el arreglo de pacientes en LocalStorage
const guardarPacientes = () => {
  try {
    localStorage.setItem(clavePacientes, JSON.stringify(arrayPaciente));
  } catch (error) {
    console.log("No se pudo guardar en LocalStorage");
  }
};

//Arreglo global de pacientes
let arrayPaciente = cargarPacientes();

//Posicion del paciente que se esta editando (-1 = ninguno)
let indiceEditar = -1;

/*
Creando una funcion para que limpie el formulario
siempre que se cargue la pagina o cuando se presione
el boton limpiar del formulario
*/

const limpiarForm = () => {
  inputNombre.value = "";
  inputApellido.value = "";
  inputFechaNacimiento.value = "";
  inputRdMasculino.checked = false;
  inputRdFemenino.checked = false;
  cmbPais.value = 0;
  inputDireccion.value = "";
  inputNombrePais.value = "";

  //Si se estaba editando un paciente, se cancela la edicion
  indiceEditar = -1;
  buttonAgregarPaciente.innerHTML = `<i class="bi bi-person-plus-fill"></i> Guardar Datos`;

  inputNombre.focus();
};

/*
 Funcion para validar el ingreso del paciente
*/

const addPaciente = function () {
  let nombre = inputNombre.value;
  let apellido = inputApellido.value;
  let fechaNacimiento = inputFechaNacimiento.value;
  let sexo =
    inputRdMasculino.checked == true
      ? "Hombre"
      : inputRdFemenino.checked == true
      ? "Mujer"
      : "";
  let pais = cmbPais.value;
  let labelPais = cmbPais.options[cmbPais.selectedIndex].text;
  let direccion = inputDireccion.value;

  if (
    nombre != "" &&
    apellido != "" &&
    fechaNacimiento != "" &&
    sexo != "" &&
    pais != 0 &&
    direccion != ""
  ) {
    const paciente = new Array(
      nombre,
      apellido,
      fechaNacimiento,
      sexo,
      labelPais,
      direccion
    );

    if (indiceEditar >= 0) {
      //Actualizando la informacion del paciente que se esta editando
      arrayPaciente[indiceEditar] = paciente;
      mensaje.innerHTML = "Se han actualizado los datos del paciente";
    } else {
      //Agregando informacion al arreglo paciente
      arrayPaciente.push(paciente);
      //Asignando un mensaje a nuestra notificacion
      mensaje.innerHTML = "Se ha registrado un nuevo paciente";
    }

    //Guardando los cambios en LocalStorage
    guardarPacientes();
    //Llamando al componente de Bootstrap
    toast.show();

    //Limpiando formulario y actualizando la tabla
    limpiarForm();
    imprimirPacientes();
  } else {
    //Asignando un mensaje a nuestra notificacion
    mensaje.innerHTML = "Faltan campos por completar";
    //Llamando al componente de Bootstrap
    toast.show();
  }
};

//Funcion que imprime la ficha de los pacientes registrados
function imprimirFilas() {
  let $fila = "";
  let contador = 1;

  arrayPaciente.forEach((element) => {
    $fila += `<tr>
                <td scope="row" class="text-center fw-bold">${contador}</td>
                <td>${element[0]}</td>
                <td>${element[1]}</td>
                <td>${element[2]}</td>
                <td>${element[3]}</td>
                <td>${element[4]}</td>
                <td>${element[5]}</td>
                <td>
                    <button id="idBtnEditar${contador}" type="button" class="btn btn-primary" alt="Eliminar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button id="idBtnEliminar${contador}" type="button" class="btn btn-danger" alt="Editar">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </td>
            </tr>`;
    contador++;
  });
  return $fila;
}

const imprimirPacientes = () => {
  let $table = `<div class="table-responsive">
                    <table class="table table-striped table-hover table-bordered">
                        <tr>
                            <th scope="col" class="text-center" style="width:5%">#</th>
                            <th scope="col" class="text-center" style="width:15%">Nombre</th>
                            <th scope="col" class="text-center" style="width:15%">Apellido</th>
                            <th scope="col" class="text-center" style="width:10%">Fecha nacimiento</th>
                            <th scope="col" class="text-center" style="width:10%">Sexo</th>
                            <th scope="col" class="text-center" style="width:10%">Pais</th>
                            <th scope="col" class="text-center" style="width:25%">Dirección</th>
                            <th scope="col" class="text-center" style="width:10%">Opciones</th>
                        </tr>
                        ${imprimirFilas()}
                    </table>
                </div>
                `;
  document.getElementById("idTablaPacientes").innerHTML = $table;
};

// Contador global de los option correspondiente
// al select (cmb) pais
let contadorGlobalOption = cmbPais.children.length;
const addPais = () => {
  let paisNew = inputNombrePais.value;

  if (paisNew != "") {
    // Creando nuevo option con la API DOM
    let option = document.createElement("option");
    option.textContent = paisNew;
    option.value = contadorGlobalOption + 1;

    //Agregando el nuevo option en el select
    cmbPais.appendChild(option);

    //Asignando un mensaje a nuestra notificacion
    mensaje.innerHTML = "Pais agregado correctamente";
    //Llamando al componente de Bootstrap
    toast.show();
  } else {
    //Asignando un mensaje a nuestra notificacion
    mensaje.innerHTML = "Faltan campos por completar";
    //Llamando al componente de Bootstrap
    toast.show();
  }
};

// Agregando eventos a los botones y utilizando funciones tipo flecha
buttonLimpiarPaciente.onclick = () => {
  limpiarForm();
};

buttonAgregarPaciente.onclick = () => {
  addPaciente();
};

buttonMostrarPaciente.onclick = () => {
  imprimirPacientes();
};

buttonAgregarPais.onclick = () => {
  addPais();
};

// Se agrega el focus en el campo nombre pais del modal
idModal.addEventListener("shown.bs.modal", () => {
  inputNombrePais.value = "";
  inputNombrePais.focus();
});

//Carga los datos de un paciente en el formulario para editarlos
const editarPaciente = (indice) => {
  const paciente = arrayPaciente[indice];

  inputNombre.value = paciente[0];
  inputApellido.value = paciente[1];
  inputFechaNacimiento.value = paciente[2];
  inputRdMasculino.checked = paciente[3] == "Hombre";
  inputRdFemenino.checked = paciente[3] == "Mujer";

  //Buscando el pais por su texto; si no existe en el select se agrega
  let opcionPais = Array.from(cmbPais.options).find(
    (opcion) => opcion.text == paciente[4]
  );
  if (!opcionPais) {
    opcionPais = document.createElement("option");
    opcionPais.textContent = paciente[4];
    opcionPais.value = cmbPais.children.length + 1;
    cmbPais.appendChild(opcionPais);
  }
  cmbPais.value = opcionPais.value;
  inputDireccion.value = paciente[5];

  indiceEditar = indice;
  buttonAgregarPaciente.innerHTML = `<i class="bi bi-check2-circle"></i> Guardar cambios`;
  inputNombre.focus();
};

//Elimina un paciente del arreglo y de LocalStorage
const eliminarPaciente = (indice) => {
  const paciente = arrayPaciente[indice];
  if (confirm(`¿Desea eliminar al paciente ${paciente[0]} ${paciente[1]}?`)) {
    arrayPaciente.splice(indice, 1);
    guardarPacientes();

    //Si se elimina el paciente que se estaba editando, se limpia el formulario
    if (indiceEditar == indice) {
      limpiarForm();
    } else if (indiceEditar > indice) {
      indiceEditar--;
    }

    imprimirPacientes();
    mensaje.innerHTML = "Se ha eliminado el paciente";
    toast.show();
  }
};

//Habilitando los botones Editar y Eliminar de la tabla.
//Los botones se crean dinamicamente, por eso el evento se agrega al contenedor
document.getElementById("idTablaPacientes").addEventListener("click", (e) => {
  const boton = e.target.closest("button");
  if (!boton) return;

  if (boton.id.startsWith("idBtnEditar")) {
    editarPaciente(parseInt(boton.id.replace("idBtnEditar", "")) - 1);
  } else if (boton.id.startsWith("idBtnEliminar")) {
    eliminarPaciente(parseInt(boton.id.replace("idBtnEliminar", "")) - 1);
  }
});

//Ejecutar funcion al momento de cargar la pagina HTML
limpiarForm();

//Si existen pacientes guardados en LocalStorage se muestran al cargar la pagina
if (arrayPaciente.length > 0) {
  imprimirPacientes();
}
