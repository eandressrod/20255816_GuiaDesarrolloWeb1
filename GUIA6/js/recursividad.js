const formularioFactorial = document.querySelector("#idFormFactorial");
const campoFactorial = document.querySelector("#idTxtNumero");
const resultadoFactorial = document.querySelector("#idDivResultado");

campoFactorial.addEventListener("input", () => {
    campoFactorial.value = campoFactorial.value.replace(/\D/g, "");
});

formularioFactorial.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const valor = campoFactorial.value.trim();

    if (!/^\d+$/.test(valor) || Number(valor) > 170) {
        resultadoFactorial.textContent = "Ingresa un número entero entre 0 y 170.";
        return;
    }

    const numero = Number(valor);
    resultadoFactorial.textContent = "El factorial de " + numero + " es " + calcularFactorial(numero) + ".";
});

function calcularFactorial(numero) {
    if (numero <= 1) {
        return 1;
    }
    return numero * calcularFactorial(numero - 1);
}
