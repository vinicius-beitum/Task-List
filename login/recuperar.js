import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { auth } from "../backend/js/firebase.js";

const formulario = document.getElementById("recuperarForm");
const email = document.getElementById("emailRecuperacao");
const erro = document.getElementById("erroEmailRecuperacao");
const botao = formulario.querySelector("button[type=submit]");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mostrarErro(texto) {
    erro.style.color = "";
    erro.textContent = texto;
    email.classList.add("input-erro");
}

function mostrarSucesso(texto) {
    erro.style.color = "#22c55e";
    erro.textContent = texto;
}

// Preenche com o e-mail lembrado no login, se houver
const emailSalvo = localStorage.getItem("email");
if (emailSalvo) email.value = emailSalvo;

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const emailDigitado = email.value.trim();

    if (emailDigitado === "") {
        mostrarErro("⚠ Digite seu e-mail.");
        return;
    }

    if (!emailRegex.test(emailDigitado)) {
        mostrarErro("⚠ Digite um e-mail válido.");
        return;
    }

    erro.textContent = "";
    email.classList.remove("input-erro");
    botao.disabled = true;
    botao.textContent = "Enviando...";

    try {
        await sendPasswordResetEmail(auth, emailDigitado);
    } catch (e) {
        console.error("Erro ao enviar e-mail de recuperação:", e);

        // Estes erros são reais e o usuário precisa saber
        if (e.code === "auth/network-request-failed") {
            mostrarErro("⚠ Erro de conexão. Verifique sua internet.");
            botao.disabled = false;
            botao.textContent = "Recuperar senha";
            return;
        }
        if (e.code === "auth/too-many-requests") {
            mostrarErro("⚠ Muitas tentativas. Tente novamente mais tarde.");
            botao.disabled = false;
            botao.textContent = "Recuperar senha";
            return;
        }
        // Qualquer outro erro (inclusive e-mail inexistente) cai na mensagem
        // genérica abaixo, para não revelar quais e-mails têm conta.
    }

    mostrarSucesso("✔ Se esse e-mail estiver cadastrado, enviamos as instruções. Confira também o spam.");

    setTimeout(function () {
        window.location.href = "login.html";
    }, 4000);
});

email.addEventListener("input", function () {
    erro.textContent = "";
    email.classList.remove("input-erro");
});
