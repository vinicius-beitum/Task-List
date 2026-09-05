const formulario = document.getElementById("cadastroForm")

const nome = document.getElementById("nome");
const email = document.getElementById("emailCadastro");
const senha = document.getElementById("senhaCadastro");
const confirmarSenha = document.getElementById("confirmarSenha");
const termos = document.getElementById("termos");
const mostrarSenha = document.getElementById("mostrarSenhaCadastro");
const mostrarConfirmarSenha = document.getElementById("mostrarConfirmarSenha");

// Mensagem de ERRO 

const erroNome = document.getElementById("erroNome");
const erroEmail = document.getElementById("erroEmailCadastro");
const erroSenha = document.getElementById("erroSenhaCadastro");
const erroConfirmarSenha = document.getElementById("erroConfirmarSenha");
const erroTermos = document.getElementById("erroTermos");

//Enviar Formulario 

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const nomeDigitado = nome.value.trim();
    const emailDigitado = email.value.trim();
    const senhaDigitada = senha.value;
    const confirmarSenhaDigitada = confirmarSenha.value;

// Validações 

if (nomeDigitado === ""){

    erroNome.textContent = "⚠ Digite seu nome.";
    nome.classList.add("input-erro");

    return;
}

if(emailDigitado === "") {

    erroEmail.textContent = "⚠ Digite seu e-mail.";
    email.classList.add("input-erro");

    return;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!emailRegex.test(emailDigitado)) {

    erroEmail.textContent = "⚠ Digite um e-mail válido.";
    email.classList.add("input-erro");

    return;
}

if(senhaDigitada === "") {

    erroSenha.textContent = "⚠ Digite uma senha.";
    senha.classList.add("input-erro");

    return;
}

if(senhaDigitada.length < 4) {

    erroSenha.textContent = "⚠ A senha deve ter pelo menos 4 caracteres.";
    senha.classList.add("input-erro");

    return;
}

if (!/[A-Z]/.test(senhaDigitada)) {

    erroSenha.textContent =
        "⚠ A senha precisa ter uma letra maiúscula.";

    senha.classList.add("input-erro");

    return;
}

if (!/[a-z]/.test(senhaDigitada)) {

    erroSenha.textContent =
        "⚠ A senha precisa ter uma letra minúscula.";

    senha.classList.add("input-erro");

    return;
}

if (!/[0-9]/.test(senhaDigitada)) {

    erroSenha.textContent =
        "⚠ A senha precisa ter um número.";

    senha.classList.add("input-erro");

    return;
}

if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(senhaDigitada)) {

    erroSenha.textContent =
        "⚠ A senha precisa ter um caractere especial.";

    senha.classList.add("input-erro");

    return;
}

if(confirmarSenhaDigitada === "") {

    erroConfirmarSenha.textContent =
        "⚠ Confirme sua senha.";

    confirmarSenha.classList.add("input-erro");

    return;
}

if(senhaDigitada !== confirmarSenhaDigitada) {

    erroConfirmarSenha.textContent =
        "⚠ As senhas não são iguais.";

    confirmarSenha.classList.add("input-erro");

    return;
} 

if(!termos.checked) {

    erroTermos.textContent =
        "⚠ Você precisa aceitar os termos e condições.";

    return;
}


// Cadastro realizado

alert("Conta criada com sucesso!");

window.location.href = "login.html";

});


// Mostrar e ocultar senha

mostrarSenha.addEventListener("click", function(){

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


// Mostrar e ocultar confirmação da senha

mostrarConfirmarSenha.addEventListener("click", function(){

    if(confirmarSenha.type === "password") {

        confirmarSenha.type = "text";

        mostrarConfirmarSenha.classList.remove("fa-eye");
        mostrarConfirmarSenha.classList.add("fa-eye-slash");

    } else {

        confirmarSenha.type = "password";

        mostrarConfirmarSenha.classList.remove("fa-eye-slash");
        mostrarConfirmarSenha.classList.add("fa-eye");

    }
});


// Limpar mensagens de erro

nome.addEventListener("input", function() {

    erroNome.textContent = "";
    nome.classList.remove("input-erro");

});

email.addEventListener("input", function() {

    erroEmail.textContent = "";
    email.classList.remove("input-erro");

});

senha.addEventListener("input", function() {

    erroSenha.textContent = "";
    senha.classList.remove("input-erro");

});

confirmarSenha.addEventListener("input", function() {

    erroConfirmarSenha.textContent = "";
    confirmarSenha.classList.remove("input-erro");

});

termos.addEventListener("change", function() {

    erroTermos.textContent = "";

});


