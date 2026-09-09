const formulario = document.getElementById("cadastroForm");

const nome = document.getElementById("nome");
const email = document.getElementById("emailCadastro");
const senha = document.getElementById("senhaCadastro");
const confirmarSenha = document.getElementById("confirmarSenha");
const termos = document.getElementById("termos");
const mostrarSenha = document.getElementById("mostrarSenhaCadastro");
const mostrarConfirmarSenha = document.getElementById("mostrarConfirmarSenha");
const requisitosSenha = document.querySelector(".requisitos-senha");

const abrirTermos = document.getElementById("abrirTermos");
const abrirPrivacidade = document.getElementById("abrirPrivacidade");
const modalTermos = document.getElementById("modalTermos");
const modalPrivacidade = document.getElementById("modalPrivacidade");
const fecharTermos = document.getElementById("fecharTermos");
const fecharPrivacidade = document.getElementById("fecharPrivacidade");
const botaoFecharTermos = document.getElementById("botaoFecharTermos");
const botaoFecharPrivacidade = document.getElementById("botaoFecharPrivacidade")

const forcaSenha =document.getElementById("forcaSenha");
const progressoForca = document.getElementById("progressoForca");
const textoForca = document.getElementById("textoForca");

const reqTamanho = document.getElementById("reqTamanho");
const reqMaiuscula = document.getElementById("reqMaiuscula");
const reqMinuscula = document.getElementById("reqMinuscula");
const reqNumero = document.getElementById("reqNumero");
const reqEspecial = document.getElementById("reqEspecial");

const cadastroLoading = document.getElementById("cadastroLoading");
const cadastroSucesso = document.getElementById("cadastroSucesso");

// Mensagens de erro
const erroNome = document.getElementById("erroNome");
const erroEmail = document.getElementById("erroEmailCadastro");
const erroSenha = document.getElementById("erroSenhaCadastro");
const erroConfirmarSenha = document.getElementById("erroConfirmarSenha");
const erroTermos = document.getElementById("erroTermos");

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const nomeDigitado = nome.value.trim();
    const emailDigitado = email.value.trim();
    const senhaDigitada = senha.value;
    const confirmarSenhaDigitada = confirmarSenha.value;

    // VALIDAÇÃO DO NOME
 
    if (nomeDigitado === "") {

        erroNome.textContent = "⚠ Digite seu nome.";
        nome.classList.add("input-erro");

        return;
    }

    // VALIDAÇÃO DO EMAIL

    if (emailDigitado === "") {

        erroEmail.textContent = "⚠ Digite seu e-mail.";
        email.classList.add("input-erro");

        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailDigitado)) {

        erroEmail.textContent = "⚠ Digite um e-mail válido.";
        email.classList.add("input-erro");

        return;
    }

    // VALIDAÇÃO DA SENHA
   

    if (senhaDigitada === "") {

        erroSenha.textContent = "⚠ Digite uma senha.";
        senha.classList.add("input-erro");

        return;
    }

    if (senhaDigitada.length < 4) {

        erroSenha.textContent =
            "⚠ A senha deve ter pelo menos 4 caracteres.";

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

    // CONFIRMAR SENHA

    if (confirmarSenhaDigitada === "") {

        erroConfirmarSenha.textContent =
            "⚠ Confirme sua senha.";

        confirmarSenha.classList.add("input-erro");

        return;
    }

    if (senhaDigitada !== confirmarSenhaDigitada) {

        erroConfirmarSenha.textContent =
            "⚠ As senhas não são iguais.";

        confirmarSenha.classList.add("input-erro");

        return;
    }

    // TERMOS

    if (!termos.checked) {

        erroTermos.textContent =
            "⚠ Você precisa aceitar os termos e condições.";

        return;
    }

    // CADASTRO REALIZADO

  // MOSTRAR TELA DE SUCESSO

cadastroLoading.classList.add("mostrar");

setTimeout(function() {

    cadastroLoading.classList.remove("mostrar");

    cadastroSucesso.classList.add("mostrar");

    setTimeout(function() {

        window.location.href = "login.html";

    }, 1500);

}, 1500);

});

// MOSTRAR / OCULTAR SENHA

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

// MOSTRAR / OCULTAR CONFIRMAÇÃO

mostrarConfirmarSenha.addEventListener("click", function() {

    if (confirmarSenha.type === "password") {

        confirmarSenha.type = "text";

        mostrarConfirmarSenha.classList.remove("fa-eye");
        mostrarConfirmarSenha.classList.add("fa-eye-slash");

    } else {

        confirmarSenha.type = "password";

        mostrarConfirmarSenha.classList.remove("fa-eye-slash");
        mostrarConfirmarSenha.classList.add("fa-eye");

    }

});

// LIMPAR ERRO DO NOME

nome.addEventListener("input", function() {

    erroNome.textContent = "";
    nome.classList.remove("input-erro");

});

// LIMPAR ERRO DO EMAIL


email.addEventListener("input", function() {

    erroEmail.textContent = "";
    email.classList.remove("input-erro");

});

// REQUISITOS DA SENHA

senha.addEventListener("input", function() {

    const valor = senha.value;


    // Mostrar requisitos somente quando digitar

    if (valor.length > 0) {

        requisitosSenha.classList.add("mostrar");

    } else {

        requisitosSenha.classList.remove("mostrar");

    }

    if (valor.length >= 4) {

        reqTamanho.classList.add("valido");

        reqTamanho.querySelector("i").classList.remove("fa-circle-xmark");
        reqTamanho.querySelector("i").classList.add("fa-circle-check");

    } else {

        reqTamanho.classList.remove("valido");

        reqTamanho.querySelector("i").classList.remove("fa-circle-check");
        reqTamanho.querySelector("i").classList.add("fa-circle-xmark");

    }

    if (/[A-Z]/.test(valor)) {

        reqMaiuscula.classList.add("valido");

        reqMaiuscula.querySelector("i").classList.remove("fa-circle-xmark");
        reqMaiuscula.querySelector("i").classList.add("fa-circle-check");

    } else {

        reqMaiuscula.classList.remove("valido");

        reqMaiuscula.querySelector("i").classList.remove("fa-circle-check");
        reqMaiuscula.querySelector("i").classList.add("fa-circle-xmark");

    }

    if (/[a-z]/.test(valor)) {

        reqMinuscula.classList.add("valido");

        reqMinuscula.querySelector("i").classList.remove("fa-circle-xmark");
        reqMinuscula.querySelector("i").classList.add("fa-circle-check");

    } else {

        reqMinuscula.classList.remove("valido");

        reqMinuscula.querySelector("i").classList.remove("fa-circle-check");
        reqMinuscula.querySelector("i").classList.add("fa-circle-xmark");

    }

    if (/[0-9]/.test(valor)) {

        reqNumero.classList.add("valido");

        reqNumero.querySelector("i").classList.remove("fa-circle-xmark");
        reqNumero.querySelector("i").classList.add("fa-circle-check");

    } else {

        reqNumero.classList.remove("valido");

        reqNumero.querySelector("i").classList.remove("fa-circle-check");
        reqNumero.querySelector("i").classList.add("fa-circle-xmark");

    }

    if (/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(valor)) {

        reqEspecial.classList.add("valido");

        reqEspecial.querySelector("i").classList.remove("fa-circle-xmark");
        reqEspecial.querySelector("i").classList.add("fa-circle-check");

    } else {

        reqEspecial.classList.remove("valido");

        reqEspecial.querySelector("i").classList.remove("fa-circle-check");
        reqEspecial.querySelector("i").classList.add("fa-circle-xmark");

    }


    // Limpar mensagem de erro

    erroSenha.textContent = "";
    senha.classList.remove("input-erro");

});

// LIMPAR ERRO DA CONFIRMAÇÃO

confirmarSenha.addEventListener("input", function() {

    erroConfirmarSenha.textContent = "";
    confirmarSenha.classList.remove("input-erro");

});

// LIMPAR ERRO DOS TERMOS

termos.addEventListener("change", function() {

    erroTermos.textContent = "";

});

senha.addEventListener("input", function() {

    const valor = senha.value;

    let pontos = 0;

    if (valor.length >= 4) {
        
        pontos++;
    }

    if (/[A-Z]/.test(valor)) {
        
        pontos++;
    }

    if (/[a-z]/.test(valor)) {

        pontos++;
    }

    if (/[0-9]/.test(valor)) {

        pontos++;
    }

      if (/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(valor)) {

        pontos++;
    }

    if (valor.length > 0) {

        forcaSenha.classList.add("mostrar");
    
    } else {

        forcaSenha.classList.remove("mostrar");
        progressoForca.style.width = "0%";
        textoForca.textContent = "Muito Fraca";

        return;
    }

    if (pontos <= 1) {

        progressoForca.style.width = "20%";
        textoForca.textContent = "Muito Fraca";
    }

    else if (pontos === 2) {

        progressoForca.style.width = "40%";
        textoForca.textContent = "Fraca";
    } 

    else if (pontos === 3 ) {

        progressoForca.style.width = "60%";
        textoForca.textContent = "Média"
    }
    else if (pontos === 4 ) {

        progressoForca.style.width = "80%"
        textoForca.textContent = "Boa"
    }
    else {
        progressoForca.style.width = "100%";
        textoForca.textContent = "Forte"
    }
});


//ABRIR TERMOS 

abrirTermos.addEventListener("click", function(event) {

    event.preventDefault();
    modalTermos.classList.add("mostrar")
});

//FECHAR TERMOS 

fecharTermos.addEventListener("click", function(event) {
    event.preventDefault();
    modalTermos.classList.remove("mostrar");
})

botaoFecharTermos.addEventListener("click", function() {
    
    modalTermos.classList.remove("mostrar");

});


// ABRIR PRIVACIDADE

abrirPrivacidade.addEventListener("click", function(event) {
    event.preventDefault();
    modalPrivacidade.classList.add("mostrar");

});

// FECHAR PRIVACIDADE

fecharPrivacidade.addEventListener("click", function() {
    modalPrivacidade.classList.remove("mostrar");

});

botaoFecharPrivacidade.addEventListener("click", function() {
    modalPrivacidade.classList.remove("mostrar");

});

// FECHAR CLICANDO FORA

modalTermos.addEventListener("click", function(event) {

    if (event.target === modalTermos) {
        modalTermos.classList.remove("mostrar");
    }

});

modalPrivacidade.addEventListener("click", function(event) {

    if (event.target === modalPrivacidade) {
        modalPrivacidade.classList.remove("mostrar");
    }

});