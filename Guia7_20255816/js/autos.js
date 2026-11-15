// CONFIGURACION DE LA API (Car API en RapidAPI)
const RAPIDAPI_KEY = "196f139db0msh5d8482be6d4d4ddp158bd8jsn1f56743fbdaf";
const RAPIDAPI_HOST = "car-api2.p.rapidapi.com";
const URL_BASE = `https://${RAPIDAPI_HOST}/api`;

// El plan gratuito solo devuelve datos de modelos 2015-2020
const ANIOS = [2020, 2019, 2018, 2017, 2016, 2015];
const POR_PAGINA = 12;

// REFERENCIAS A ELEMENTOS HTML
const formBusqueda = document.getElementById("idFormBusqueda");
const cmbAnio = document.getElementById("idAnio");
const cmbMarca = document.getElementById("idMarca");
const btnBuscar = document.getElementById("idBtnBuscar");
const estado = document.getElementById("idEstado");
const resumen = document.getElementById("idResumen");
const listaAutos = document.getElementById("idListaAutos");
const paginacion = document.getElementById("idPaginacion");
const btnAnterior = document.getElementById("idBtnAnterior");
const btnSiguiente = document.getElementById("idBtnSiguiente");
const textoPagina = document.getElementById("idPagina");
const detalle = document.getElementById("idDetalle");

// Estado de la busqueda actual
let paginaActual = 1;
let totalPaginas = 1;
let busquedaActual = { anio: "", marca: "" };
let solicitudDetalle = 0;
let solicitudMarcas = 0;

// ---------- Utilidades del DOM ----------

const limpiarNodo = function (nodo) {
    while (nodo.firstChild) {
        nodo.removeChild(nodo.firstChild);
    }
};

const crear = function (etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) {
        elemento.setAttribute("class", clase);
    }
    if (texto !== undefined && texto !== null) {
        elemento.appendChild(document.createTextNode(texto));
    }
    return elemento;
};

const mostrarEstado = function (mensaje, tipo = "") {
    estado.setAttribute("class", `estado ${tipo}`.trim());
    estado.textContent = mensaje;
};

const formatearPrecio = function (valor) {
    if (!valor) {
        return "Precio no disponible";
    }
    return Number(valor).toLocaleString("es-SV", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    });
};

// ---------- Consumo de la API ----------

const consultarApi = async function (ruta, parametros = {}) {
    if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "PEGA_AQUI_TU_API_KEY") {
        throw new Error("Falta la API key de RapidAPI en js/autos.js.");
    }

    const url = new URL(`${URL_BASE}${ruta}`);
    for (const [nombre, valor] of Object.entries(parametros)) {
        if (valor !== "" && valor !== undefined) {
            url.searchParams.set(nombre, valor);
        }
    }

    let respuesta;
    try {
        respuesta = await fetch(url, {
            method: "GET",
            headers: {
                "x-rapidapi-key": RAPIDAPI_KEY,
                "x-rapidapi-host": RAPIDAPI_HOST
            }
        });
    } catch (error) {
        throw new Error("No se pudo conectar con la API. Revisa tu conexión a internet.");
    }

    if (!respuesta.ok) {
        const mensajes = {
            401: "La API key no es válida.",
            403: "No tienes acceso a esta API. Verifica tu suscripción al plan gratuito.",
            404: "No se encontró el recurso solicitado.",
            429: "Se alcanzó el límite de solicitudes del plan gratuito. Intenta más tarde."
        };
        throw new Error(mensajes[respuesta.status] || `La API respondió con un error (${respuesta.status}).`);
    }

    return respuesta.json();
};

// ---------- Marcas (para el filtro) ----------

const cargarAnios = function () {
    for (const anio of ANIOS) {
        const opcion = crear("option", null, anio);
        opcion.value = anio;
        cmbAnio.appendChild(opcion);
    }
};

const cargarMarcas = async function () {
    // Evita que una respuesta de un año anterior reemplace la del año actual
    const numeroSolicitud = ++solicitudMarcas;

    cmbMarca.disabled = true;
    btnBuscar.disabled = true;
    limpiarNodo(cmbMarca);
    cmbMarca.appendChild(crear("option", null, "Cargando marcas…"));
    mostrarEstado("Cargando marcas disponibles…", "cargando");

    try {
        const respuesta = await consultarApi("/makes", { year: cmbAnio.value, limit: 100 });
        if (numeroSolicitud !== solicitudMarcas) {
            return;
        }
        const marcas = (respuesta.data || [])
            .map((marca) => marca.name)
            .sort((a, b) => a.localeCompare(b));

        limpiarNodo(cmbMarca);
        const todas = crear("option", null, "Todas las marcas");
        todas.value = "";
        cmbMarca.appendChild(todas);

        for (const marca of marcas) {
            const opcion = crear("option", null, marca);
            opcion.value = marca;
            cmbMarca.appendChild(opcion);
        }

        cmbMarca.disabled = false;
        btnBuscar.disabled = false;
        mostrarEstado(`${marcas.length} marcas disponibles para ${cmbAnio.value}.`);
    } catch (error) {
        if (numeroSolicitud !== solicitudMarcas) {
            return;
        }
        limpiarNodo(cmbMarca);
        cmbMarca.appendChild(crear("option", null, "Sin marcas"));
        mostrarEstado(error.message, "error");
    }
};

// ---------- Endpoint 1: listado de versiones ----------

const crearTarjeta = function (auto) {
    const marca = auto.make_model?.make?.name ?? "";
    const modelo = auto.make_model?.name ?? "";

    const boton = crear("button", "tarjeta");
    boton.setAttribute("type", "button");
    boton.dataset.id = auto.id;

    boton.appendChild(crear("span", "anio", auto.year));
    boton.appendChild(crear("span", "modelo", `${marca} ${modelo}`.trim()));
    boton.appendChild(crear("span", "version", auto.description || auto.name));
    boton.appendChild(crear("span", "precio", formatearPrecio(auto.msrp)));

    boton.addEventListener("click", () => {
        for (const tarjeta of listaAutos.querySelectorAll(".tarjeta")) {
            tarjeta.classList.remove("activa");
        }
        boton.classList.add("activa");
        cargarDetalle(auto.id);
    });

    const item = crear("li");
    item.appendChild(boton);
    return item;
};

const cargarListado = async function () {
    btnBuscar.disabled = true;
    btnAnterior.disabled = true;
    btnSiguiente.disabled = true;
    mostrarEstado("Buscando versiones…", "cargando");

    try {
        const respuesta = await consultarApi("/trims", {
            year: busquedaActual.anio,
            make: busquedaActual.marca,
            verbose: "yes",
            sort: "id",
            direction: "asc",
            limit: POR_PAGINA,
            page: paginaActual
        });

        const autos = respuesta.data || [];
        const coleccion = respuesta.collection || {};
        totalPaginas = coleccion.pages || 1;

        limpiarNodo(listaAutos);
        for (const auto of autos) {
            listaAutos.appendChild(crearTarjeta(auto));
        }

        if (autos.length === 0) {
            resumen.textContent = "";
            paginacion.hidden = true;
            mostrarEstado("No se encontraron versiones con esos filtros.");
            return;
        }

        const total = coleccion.total || autos.length;
        const etiquetaMarca = busquedaActual.marca || "todas las marcas";
        resumen.textContent = `${total} resultados · ${etiquetaMarca} · ${busquedaActual.anio}`;
        textoPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
        paginacion.hidden = totalPaginas <= 1;
        btnAnterior.disabled = paginaActual <= 1;
        btnSiguiente.disabled = paginaActual >= totalPaginas;
        mostrarEstado("Selecciona una versión para ver su ficha técnica.");
    } catch (error) {
        mostrarEstado(error.message, "error");
    } finally {
        btnBuscar.disabled = false;
    }
};

// ---------- Endpoint 2: detalle de una version ----------

const agregarDatos = function (contenedor, titulo, pares) {
    const visibles = pares.filter(([, valor]) => valor !== null && valor !== undefined && valor !== "");
    if (visibles.length === 0) {
        return;
    }

    contenedor.appendChild(crear("h4", null, titulo));
    const lista = crear("dl", "datos");
    for (const [nombre, valor] of visibles) {
        lista.appendChild(crear("dt", null, nombre));
        lista.appendChild(crear("dd", null, valor));
    }
    contenedor.appendChild(lista);
};

const agregarColores = function (contenedor, titulo, colores) {
    if (!Array.isArray(colores) || colores.length === 0) {
        return;
    }

    contenedor.appendChild(crear("h4", null, titulo));
    const lista = crear("ul", "colores");
    for (const color of colores) {
        const item = crear("li");
        const muestra = crear("span", "muestra");
        if (color.rgb) {
            muestra.style.backgroundColor = `rgb(${color.rgb})`;
        }
        item.appendChild(muestra);
        item.appendChild(document.createTextNode(color.name));
        lista.appendChild(item);
    }
    contenedor.appendChild(lista);
};

const conUnidad = function (valor, unidad) {
    return valor ? `${valor} ${unidad}` : null;
};

const mostrarDetalle = function (auto) {
    limpiarNodo(detalle);

    const marca = auto.make_model?.make?.name ?? "";
    const modelo = auto.make_model?.name ?? "";
    const motor = auto.make_model_trim_engine ?? auto.make_model_trim_engines?.[0] ?? {};
    const carroceria = auto.make_model_trim_body ?? auto.make_model_trim_bodies?.[0] ?? {};
    const consumo = auto.make_model_trim_mileage ?? auto.make_model_trim_mileages?.[0] ?? {};

    detalle.appendChild(crear("p", "eyebrow", `${auto.year} · ${auto.name}`));
    detalle.appendChild(crear("h3", null, `${marca} ${modelo}`.trim()));
    detalle.appendChild(crear("p", "descripcion", auto.description));

    agregarDatos(detalle, "Precio", [
        ["Precio sugerido", auto.msrp ? formatearPrecio(auto.msrp) : null],
        ["Precio de factura", auto.invoice ? formatearPrecio(auto.invoice) : null]
    ]);

    agregarDatos(detalle, "Motor", [
        ["Tipo", motor.engine_type],
        ["Combustible", motor.fuel_type],
        ["Cilindros", motor.cylinders],
        ["Cilindrada", conUnidad(motor.size, "L")],
        ["Potencia", motor.horsepower_hp ? `${motor.horsepower_hp} hp a ${motor.horsepower_rpm} rpm` : null],
        ["Torque", motor.torque_ft_lbs ? `${motor.torque_ft_lbs} lb-ft a ${motor.torque_rpm} rpm` : null],
        ["Tracción", motor.drive_type],
        ["Transmisión", motor.transmission]
    ]);

    agregarDatos(detalle, "Carrocería", [
        ["Tipo", carroceria.type],
        ["Puertas", carroceria.doors],
        ["Asientos", carroceria.seats],
        ["Largo", conUnidad(carroceria.length, "in")],
        ["Ancho", conUnidad(carroceria.width, "in")],
        ["Alto", conUnidad(carroceria.height, "in")],
        ["Peso en vacío", conUnidad(carroceria.curb_weight, "lb")]
    ]);

    agregarDatos(detalle, "Consumo", [
        ["Ciudad", conUnidad(consumo.epa_city_mpg, "mpg")],
        ["Carretera", conUnidad(consumo.epa_highway_mpg, "mpg")],
        ["Combinado", conUnidad(consumo.combined_mpg, "mpg")],
        ["Tanque", conUnidad(consumo.fuel_tank_capacity, "gal")]
    ]);

    agregarColores(detalle, "Colores exteriores", auto.make_model_trim_exterior_colors);
    agregarColores(detalle, "Colores interiores", auto.make_model_trim_interior_colors);
};

const cargarDetalle = async function (id) {
    // Evita que una respuesta lenta reemplace una seleccion mas reciente
    const numeroSolicitud = ++solicitudDetalle;

    limpiarNodo(detalle);
    detalle.appendChild(crear("p", "vacio", "Cargando ficha técnica…"));
    mostrarEstado("Consultando el detalle de la versión…", "cargando");

    if (window.matchMedia("(max-width: 900px)").matches) {
        detalle.scrollIntoView({ block: "start" });
    }

    try {
        const auto = await consultarApi(`/trims/${id}`);
        if (numeroSolicitud !== solicitudDetalle) {
            return;
        }
        mostrarDetalle(auto);
        mostrarEstado("Ficha técnica cargada.");
    } catch (error) {
        if (numeroSolicitud !== solicitudDetalle) {
            return;
        }
        limpiarNodo(detalle);
        detalle.appendChild(crear("p", "vacio", "No se pudo cargar el detalle."));
        mostrarEstado(error.message, "error");
    }
};

// ---------- Eventos ----------

formBusqueda.addEventListener("submit", (evento) => {
    evento.preventDefault();
    busquedaActual = { anio: cmbAnio.value, marca: cmbMarca.value };
    paginaActual = 1;
    cargarListado();
});

cmbAnio.addEventListener("change", cargarMarcas);

btnAnterior.addEventListener("click", () => {
    if (paginaActual > 1) {
        paginaActual--;
        cargarListado();
    }
});

btnSiguiente.addEventListener("click", () => {
    if (paginaActual < totalPaginas) {
        paginaActual++;
        cargarListado();
    }
});

// ---------- Inicio ----------

cargarAnios();
cargarMarcas();
