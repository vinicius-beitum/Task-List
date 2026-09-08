const formulario = document.getElementById("loginForm");

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const lembrar = document.getElementById("lembrar");
const verSenha = document.getElementById("verSenha");

const erroEmail = document.getElementById("erroEmail");
const erroSenha = document.getElementById("erroSenha");

const loginLoading = document.getElementById("loginLoading");
const loginSucesso = document.getElementById("loginSucesso");


// =============================
// CARREGAR E-MAIL SALVO
// =============================

window.addEventListener("load", function() {

    const emailSalvo = localStorage.getItem("email");

    if (emailSalvo) {

        email.value = emailSalvo;

        lembrar.checked = true;

    }

});


// =============================
// FORMULÁRIO DE LOGIN
// =============================

formulario.addEventListener("submit", function(event) {

    event.preventDefault();


    const emailDigitado = email.value.trim();

    const senhaDigitada = senha.value;


    // =============================
    // VERIFICAR E-MAIL
    // =============================

    if (emailDigitado === "") {

        erroEmail.textContent = "⚠ Digite seu e-mail.";

        email.classList.add("input-erro");

        return;

    }


    // =============================
    // VERIFICAR SENHA
    // =============================

    if (senhaDigitada === "") {

        erroSenha.textContent = "⚠ Digite sua senha.";

        senha.classList.add("input-erro");

        return;

    }


    // =============================
    // VALIDAR E-MAIL
    // =============================

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(emailDigitado)) {

        erroEmail.textContent = "⚠ Digite um e-mail válido.";

        email.classList.add("input-erro");

        return;

    }


    // =============================
    // VALIDAR TAMANHO DA SENHA
    // =============================

    if (senhaDigitada.length < 4) {

        erroSenha.textContent =
            "⚠ A senha deve ter pelo menos 4 caracteres.";

        senha.classList.add("input-erro");

        return;

    }


    // =============================
    // LETRA MAIÚSCULA
    // =============================

    if (!/[A-Z]/.test(senhaDigitada)) {

        erroSenha.textContent =
            "⚠ A senha deve conter pelo menos uma letra maiúscula.";

        senha.classList.add("input-erro");

        return;

    }


    // =============================
    // LETRA MINÚSCULA
    // =============================

    if (!/[a-z]/.test(senhaDigitada)) {

        erroSenha.textContent =
            "⚠ A senha deve conter pelo menos uma letra minúscula.";

        senha.classList.add("input-erro");

        return;

    }


    // =============================
    // NÚMERO
    // =============================

    if (!/[0-9]/.test(senhaDigitada)) {

        erroSenha.textContent =
            "⚠ A senha deve conter pelo menos um número.";

        senha.classList.add("input-erro");

        return;

    }


    // =============================
    // CARACTERE ESPECIAL
    // =============================

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(senhaDigitada)) {

        erroSenha.textContent =
            "⚠ A senha deve conter pelo menos um caractere especial.";

        senha.classList.add("input-erro");

        return;

    }

    // LEMBRAR E-MAIL
  

    if (lembrar.checked) {

        localStorage.setItem("email", emailDigitado);

    } else {

        localStorage.removeItem("email");

    }

    // MOSTRAR LOADING

    loginLoading.classList.add("mostrar");

    setTimeout(function() {


        // Esconde o loading

        loginLoading.classList.remove("mostrar");


        // Mostra sucesso

        loginSucesso.classList.add("mostrar");


        // Depois de 1 segundo vai para Home

        setTimeout(function() {

            window.location.href = "../home/home.html";

        }, 1000);


    }, 1500);

});

// MOSTRAR / OCULTAR SENHA

verSenha.addEventListener("click", function() {

    if (senha.type === "password") {

        senha.type = "text";

        verSenha.classList.remove("fa-eye");

        verSenha.classList.add("fa-eye-slash");

    } else {

        senha.type = "password";

        verSenha.classList.remove("fa-eye-slash");

        verSenha.classList.add("fa-eye");

    }

});

// LIMPAR ERRO DO E-MAIL

email.addEventListener("input", function() {

    erroEmail.textContent = "";

    email.classList.remove("input-erro");

});

// LIMPAR ERRO DA SENHA

senha.addEventListener("input", function() {

    erroSenha.textContent = "";

    senha.classList.remove("input-erro");

});