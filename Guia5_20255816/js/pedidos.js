let pedidos = [];
let precioMaximo = null;

const formulario = document.querySelector("#formPedido");
const productoInput = document.querySelector("#producto");
const precioInput = document.querySelector("#precio");
const cantidadInput = document.querySelector("#cantidad");
const filtroInput = document.querySelector("#precioMaximo");
const tabla = document.querySelector("#tablaPedidos");
const mensaje = document.querySelector("#mensaje");

function validarPedido(pedido) {
    if (pedido.producto === "") return "Ingrese el nombre del producto.";
    if (!Number.isFinite(pedido.precio) || pedido.precio <= 0) return "Ingrese un precio mayor a cero.";
    if (!Number.isInteger(pedido.cantidad) || pedido.cantidad <= 0) return "Ingrese una cantidad entera mayor a cero.";
    return "";
}

function filtrarPedidos(lista, maximo) {
    return lista.filter(pedido => pedido.precio <= maximo);
}

function calcularTotales(lista) {
    return lista.reduce((totales, pedido) => {
        totales.unidades += pedido.cantidad;
        totales.monto += pedido.precio * pedido.cantidad;
        return totales;
    }, { unidades: 0, monto: 0 });
}

function mostrarMensaje(texto) {
    mensaje.textContent = texto;
    mensaje.hidden = texto === "";
}

function mostrarPedidos(lista) {
    const filas = lista.map(pedido => {
        const fila = document.createElement("tr");
        const datos = [pedido.producto, `$${pedido.precio.toFixed(2)}`, pedido.cantidad, `$${(pedido.precio * pedido.cantidad).toFixed(2)}`];
        const celdas = datos.map(dato => {
            const celda = document.createElement("td");
            celda.textContent = dato;
            return celda;
        });
        celdas[0].className = "text-break";
        fila.append(...celdas);
        return fila;
    });

    tabla.replaceChildren(...filas);

    if (lista.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 4;
        celda.textContent = "No hay pedidos para mostrar.";
        fila.append(celda);
        tabla.append(fila);
    }
}

function actualizarVista() {
    const visibles = precioMaximo === null ? pedidos : filtrarPedidos(pedidos, precioMaximo);
    mostrarPedidos(visibles);

    const totales = calcularTotales(pedidos);
    document.querySelector("#totalUnidades").textContent = totales.unidades;
    document.querySelector("#montoTotal").textContent = `$${totales.monto.toFixed(2)}`;
}

function agregarPedido(evento) {
    evento.preventDefault();

    const pedido = {
        producto: productoInput.value.trim(),
        precio: Number(precioInput.value),
        cantidad: Number(cantidadInput.value)
    };
    const error = validarPedido(pedido);
    if (error) {
        mostrarMensaje(error);
        return;
    }

    pedidos.push(pedido);
    formulario.reset();
    mostrarMensaje("");
    actualizarVista();
    productoInput.focus();
}

function aplicarFiltro() {
    const maximo = Number(filtroInput.value);
    if (filtroInput.value.trim() === "" || !Number.isFinite(maximo) || maximo < 0) {
        mostrarMensaje("Ingrese un precio máximo mayor o igual a cero.");
        return;
    }

    precioMaximo = maximo;
    mostrarMensaje("");
    actualizarVista();
}

function mostrarTodos() {
    precioMaximo = null;
    filtroInput.value = "";
    mostrarMensaje("");
    actualizarVista();
}

function limpiarPedidos() {
    pedidos = [];
    mostrarTodos();
}

formulario.addEventListener("submit", agregarPedido);
document.querySelector("#btnFiltrar").addEventListener("click", aplicarFiltro);
document.querySelector("#btnMostrar").addEventListener("click", mostrarTodos);
document.querySelector("#btnLimpiar").addEventListener("click", limpiarPedidos);

actualizarVista();
