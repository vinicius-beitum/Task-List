const formulario = document.getElementById("loginForm");

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const lembrar = document.getElementById("lembrar");
const mostrarSenha = document.getElementById("mostrarSenha");


// =====================================
// CARREGAR E-MAIL SALVO
// =====================================

window.addEventListener("load", function() {

    const emailSalvo = localStorage.getItem("email");

    if (emailSalvo) {

        email.value = emailSalvo;
        lembrar.checked = true;

    }

});


// =====================================
// FORMULÁRIO DE LOGIN
// =====================================

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const emailDigitado = email.value;
    const senhaDigitada = senha.value;


    // Verificação de email e senha

    if (emailDigitado === "") {

        alert("Digite seu e-mail.");
        return;

    }

    if (senhaDigitada === "") {

        alert("Digite sua senha.");
        return;

    }


    // =====================================
    // VALIDAÇÃO DO E-MAIL
    // =====================================

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailDigitado)) {

        alert("Digite um email válido.");
        return;

    }


    // =====================================
    // VALIDAÇÃO DA SENHA
    // =====================================

    if (senhaDigitada.length < 4) {

        alert("A senha deve ter pelo menos 4 caracteres!");
        return;

    }


    // Letra maiúscula

    if (!/[A-Z]/.test(senhaDigitada)) {

        alert("A senha deve conter pelo menos uma letra maiúscula!");
        return;

    }


    // Letra minúscula

    if (!/[a-z]/.test(senhaDigitada)) {

        alert("A senha deve conter pelo menos uma letra minúscula!");
        return;

    }


    // Número

    if (!/[0-9]/.test(senhaDigitada)) {

        alert("A senha deve conter pelo menos um número!");
        return;

    }


    // Caractere especial

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(senhaDigitada)) {

        alert("A senha deve conter pelo menos um caractere especial!");
        return;

    }


    // =====================================
    // LEMBRAR E-MAIL
    // =====================================

    if (lembrar.checked) {

        localStorage.setItem("email", emailDigitado);

    } else {

        localStorage.removeItem("email");

    }


    // =====================================
    // IR PARA A HOME
    // =====================================

    window.location.href = "../home/home.html";

});


// =====================================
// MOSTRAR / OCULTAR SENHA
// =====================================

mostrarSenha.addEventListener("click", function() {

    if (senha.type === "password") {

        senha.type = "text";

        mostrarSenha.classList.remove("fa-eye");
        mostrarSenha.classList.add("fa-eye-slash");

    } else {

        senha.type = "password";

        mostrarSenha.classList.remove("fa-eye-slash");
        mostrarSenha.classList.add("fa-eye");

    }

});