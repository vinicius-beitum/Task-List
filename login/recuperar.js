const formulario= document.getElementById("recuperarForm");
const email = document.getElementById("email");
const erro = document.getElementById("erroRecuperacao");

// RECUPERAÇÃO DE SENHA 

formulario.addEventListener("submit", function(event) {

    event.preventDefault();
    const emailDigitado = email.value.trim();

if (emailDigitado === "") {
    erro.textContent = " ⚠ Digite seu e-mail.";
    email.classList.add("input-erro");
    return;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(emailDigitado)) {
    erro.textContent = " ⚠ Digite um e-mail válido.";
    email.classList.add("input-erro");
    return;
}

error.textContent = "";
email.classList.remove("input-erro");

alert("Se esse email estiver cadastrado , você receberá as instruções para recuperar sua senha.");

window.location.href = "login.html";
});

emial.addEventListener("input", function() {
    erro.textContent = "";
    email.classList.remove("input-erro");
});