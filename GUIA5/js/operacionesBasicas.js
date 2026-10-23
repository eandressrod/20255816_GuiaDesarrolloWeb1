const parrafo = document.querySelector("#idParrafo");

function calcular(operacion) {
    const entrada1 = prompt("Ingrese el primer número");
    if (entrada1 === null) return;

    const entrada2 = prompt("Ingrese el segundo número");
    if (entrada2 === null) return;

    const numero1 = Number(entrada1);
    const numero2 = Number(entrada2);

    if (entrada1.trim() === "" || entrada2.trim() === "" || !Number.isFinite(numero1) || !Number.isFinite(numero2)) {
        parrafo.textContent = "Ingrese dos números válidos.";
        return;
    }

    let resultado;
    switch (operacion) {
        case "+":
            resultado = numero1 + numero2;
            break;
        case "-":
            resultado = numero1 - numero2;
            break;
        case "×":
            resultado = numero1 * numero2;
            break;
        case "/":
            if (numero2 === 0) {
                parrafo.textContent = "No se puede dividir entre cero.";
                return;
            }
            resultado = numero1 / numero2;
            break;
    }

    parrafo.textContent = `${numero1} ${operacion} ${numero2} = ${resultado}`;
}

document.querySelector("#idBtnSumar").addEventListener("click", () => calcular("+"));
document.querySelector("#idBtnRestar").addEventListener("click", () => calcular("-"));
document.querySelector("#idBtnMultiplicar").addEventListener("click", () => calcular("×"));
document.querySelector("#idBtnDividir").addEventListener("click", () => calcular("/"));
