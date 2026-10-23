const numeroAleatorio = Math.floor(Math.random() * 25) + 1;
const numeroIntentos = 3;
let intentos = 0;

const parrafo = document.querySelector("#idParrafo");
const boton = document.querySelector("#idBtnNumero");

function generarNumeroAleatorio() {
    const entrada = prompt(`¿Qué número se ha generado? Intento ${intentos + 1} de ${numeroIntentos}`);
    if (entrada === null) return;

    const numero = Number(entrada);
    if (entrada.trim() === "" || !Number.isInteger(numero) || numero < 1 || numero > 25) {
        parrafo.textContent = "Ingrese un número entero del 1 al 25.";
        return;
    }

    intentos++;

    if (numero === numeroAleatorio) {
        parrafo.textContent = `Adivinaste el número: ${numeroAleatorio}. Recarga la página para volver a jugar.`;
        boton.disabled = true;
    } else if (intentos === numeroIntentos) {
        parrafo.textContent = `Se terminaron los intentos. El número era ${numeroAleatorio}. Recarga la página para volver a jugar.`;
        boton.disabled = true;
    } else {
        parrafo.textContent = `Vuelve a intentar. Quedan ${numeroIntentos - intentos} intentos.`;
    }
}

boton.addEventListener("click", generarNumeroAleatorio);
