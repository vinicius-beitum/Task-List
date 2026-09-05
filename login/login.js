const formulario = document.getElementById("loginForm");

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const lembrar = document.getElementById("lembrar");
const verSenha = document.getElementById("verSenha");
const erroEmail = document.getElementById("erroEmail");
const erroSenha = document.getElementById("erroSenha");

// CARREGAR E-MAIL SALVO


window.addEventListener("load", function() {

    const emailSalvo = localStorage.getItem("email");

    if (emailSalvo) {

        email.value = emailSalvo;
        lembrar.checked = true;

    }

});


// FORMULÁRIO DE LOGIN

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const emailDigitado = email.value;
    const senhaDigitada = senha.value;


    // Verificação de email e senha

    if (emailDigitado === "") {

       erroEmail.textContent = " ⚠ Digite seu e-mail.";
       email.classList.add("input-erro");

       return;

    }

    if (senhaDigitada === "") {

        erroSenha.textContent = " ⚠ Digite sua senha.";
        senha.classList.add("input-erro");

        return;

    }

    // VALIDAÇÃO DO E-MAIL
  

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailDigitado)) {

         erroEmail.textContent = " ⚠ Digite um e-mail válido.";
         email.classList.add("input-erro");

         return;
    }


    // VALIDAÇÃO DA SENHA


    if (senhaDigitada.length < 4) {

       erroSenha.textContent = " ⚠ A senha deve ter pelo menos 4 caracteres.";
       senha.classList.add("input-erro");

       return;

    }


    // Letra maiúscula

    if (!/[A-Z]/.test(senhaDigitada)) {

       erroSenha.textContent = " ⚠ A senha deve conter pelo menos uma letra maiúscula.";
       senha.classList.add("input-erro");

       return;
    }


    // Letra minúscula

    if (!/[a-z]/.test(senhaDigitada)) {
       erroSenha.textContent = " ⚠ A senha deve conter pelo menos uma letra minúscula.";
       senha.classList.add("input-erro");

       return;
    }


    // Número

    if (!/[0-9]/.test(senhaDigitada)) {

         erroSenha.textContent = " ⚠ A senha deve conter pelo menos um número.";
         senha.classList.add("input-erro");

         return;

    }


    // Caractere especial

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(senhaDigitada)) {

        erroSenha.textContent = " ⚠ A senha deve conter pelo menos um caractere especial!";
        senha.classList.add("input-erro");

        return;

    }

// LEMBRAR E-MAIL


    if (lembrar.checked) {

        localStorage.setItem("email", emailDigitado);

    } else {

        localStorage.removeItem("email");

    }

// IR PARA A HOME

    window.location.href = "../home/home.html";

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

email.addEventListener("input", function() {

   erroEmail.textContent = "";
   email.classList.remove("input-erro");
});

senha.addEventListener("input", function() {

   erroSenha.textContent = "";
   senha.classList.remove("input-erro");
});