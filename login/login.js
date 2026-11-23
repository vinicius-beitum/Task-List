import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import { auth, db } from "../backend/js/firebase.js";

const formulario = document.getElementById("loginForm");

const email = document.getElementById("email");
const iconeEmail = document.getElementById("iconeEmail");
const trocarConta = document.getElementById("trocarConta");
const limparEmail = document.getElementById("limparEmail");
const saudacaoLogin = document.getElementById("saudacaoLogin");
const emailSalvoLogin = document.getElementById("emailSalvoLogin");
const senha = document.getElementById("senha");
const lembrar = document.getElementById("lembrar");
const verSenha = document.getElementById("verSenha");
const capsLock = document.getElementById("capsLock");

const erroEmail = document.getElementById("erroEmail");
const erroSenha = document.getElementById("erroSenha");

const loginLoading = document.getElementById("loginLoading");
const loginSucesso = document.getElementById("loginSucesso");

let loginEmAndamento = false;

// Se já existe sessão ativa, vai direto para a home
onAuthStateChanged(auth, function(usuario) {
    if (usuario && !loginEmAndamento) {
        window.location.replace("../home/home.html");
    }
});

function campoComErro(campo) {
    
    campo.classList.remove("campo-treme");
    void campo.offsetWidth;
    campo.classList.add("campo-treme");
}

// CARREGAR E-MAIL SALVO

window.addEventListener("load", function() {

    const emailSalvo = localStorage.getItem("email");

    if (emailSalvo) {

        email.value = emailSalvo;

        lembrar.checked = true;

        saudacaoLogin.querySelector("h1").textContent = "Olá Novamente! 💪"
        emailSalvoLogin.textContent = emailSalvo
        
        trocarConta.classList.add("mostrar");
    } else {
        saudacaoLogin.querySelector("h1").textContent = "Entrar na sua conta ";
        emailSalvoLogin.textContent = "";
        trocarConta.style.display = "none";
    }
});

// FORMULÁRIO DE LOGIN


formulario.addEventListener("submit", async function(event) {

    event.preventDefault();


    const emailDigitado = email.value.trim();

    const senhaDigitada = senha.value;

    // VERIFICAR E-MAIL
 

    if (emailDigitado === "") {

        erroEmail.textContent = "⚠ Digite seu e-mail.";

        email.classList.add("input-erro");
        campoComErro(email);

        return;

    }

    // VERIFICAR SENHA

    if (senhaDigitada === "") {

        erroSenha.textContent = "⚠ Digite sua senha.";

        senha.classList.add("input-erro");
        campoComErro(senha);

        return;

    }

    // VALIDAR E-MAIL

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(emailDigitado)) {

        erroEmail.textContent = "⚠ Digite um e-mail válido.";

        email.classList.add("input-erro");
        campoComErro(email);

        return;

    }

    // Obs.: as regras de complexidade da senha valem só no cadastro.
    // No login quem decide se a senha está certa é o Firebase.

    // LEMBRAR E-MAIL

    if (lembrar.checked) {
        localStorage.setItem("email", emailDigitado);
    } else {
        localStorage.removeItem("email");
    }

    // MOSTRAR LOADING

    loginLoading.classList.add("mostrar");
    loginEmAndamento = true;

    try {

        // "Lembrar" marcado = sessão fica salva; desmarcado = acaba ao fechar a aba
        await setPersistence(
            auth,
            lembrar.checked ? browserLocalPersistence : browserSessionPersistence
        );

        // AUTENTICAR USUÁRIO NO FIREBASE

        await signInWithEmailAndPassword(
            auth,
            emailDigitado,
            senhaDigitada
        );

        // LOGIN REALIZADO

        loginLoading.classList.remove("mostrar");
        loginSucesso.classList.add("mostrar");

        setTimeout(function() {
            window.location.href = "../home/home.html";
        }, 1000);

    } catch (erro) {

        loginEmAndamento = false;
        loginLoading.classList.remove("mostrar");

        console.error("Erro no login:", erro);

        if (erro.code === "auth/invalid-email") {

            erroEmail.textContent = "⚠ Digite um e-mail válido.";
            campoComErro(email);

        } else if (
            erro.code === "auth/invalid-credential" ||
            erro.code === "auth/wrong-password" ||
            erro.code === "auth/user-not-found"
        ) {

            erroEmail.textContent = "E-mail ou senha incorretos.";
            campoComErro(email);
            campoComErro(senha);

        } else if (erro.code === "auth/too-many-requests") {

            erroSenha.textContent =
                "Muitas tentativas. Tente novamente mais tarde.";

            campoComErro(senha);

        } else if (erro.code === "auth/network-request-failed") {

            erroEmail.textContent =
                "Erro de conexão. Verifique sua internet.";

        } else {

            erroEmail.textContent =
                "Não foi possível entrar. Tente novamente.";
        }
    }

});


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

    const valor = email.value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    erroEmail.textContent = "";

    email.classList.remove("input-erro");

    iconeEmail.classList.remove("email-valido");
    iconeEmail.classList.remove("email-invalido");

    if(valor === "") {
        return;
    }

    if(emailRegex.test(valor)) {

        iconeEmail.classList.add("email-valido");
    } else {
        iconeEmail.classList.add("email-invalido")
    }
});

// LIMPAR ERRO DA SENHA

senha.addEventListener("input", function() {

    erroSenha.textContent = "";

    senha.classList.remove("input-erro");

});


email.addEventListener("keydown" , function(event) {

    if(event.key === "Enter") {
        event.preventDefault();
        senha.focus()
    }
});

senha.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        event.preventDefault();
        formulario.requestSubmit()
    }
});

senha.addEventListener("keyup", function(event) {

    if (event.getModifierState("CapsLock")) {

        capsLock.classList.add("mostrar");

    } else {

        capsLock.classList.remove("mostrar");

    }

});

// MOSTRAR / ESCONDER BOTÃO DE LIMPAR E-MAIL X

email.addEventListener("input", function() {

    if (email.value.length > 0) {

        limparEmail.classList.add("mostrar");

    } else {

        limparEmail.classList.remove("mostrar");
        trocarConta.classList.remove("mostrar");
    }

});

// LIMPAR E-MAIL

limparEmail.addEventListener("click", function() {

    email.value = "";

    limparEmail.classList.remove("mostrar");

    erroEmail.textContent = "";

    email.classList.remove("input-erro");

    email.focus();

});

trocarConta.addEventListener("click", function() {

    localStorage.removeItem("email");

    email.value = "";

    lembrar.checked = false;

    saudacaoLogin.querySelector("h1").textContent = 
    "Entrar na sua Conta";

    emailSalvoLogin.textContent = "";

    trocarConta.style.display = "none";

    email.focus();
});


// LOGIN COM GOOGLE

const botaoGoogle = document.querySelector(".botao-social.google");
const botaoApple = document.querySelector(".botao-social.apple");

botaoGoogle.addEventListener("click", async function() {

    loginEmAndamento = true;
    erroEmail.textContent = "";

    try {

        await setPersistence(
            auth,
            lembrar.checked ? browserLocalPersistence : browserSessionPersistence
        );

        const resultado = await signInWithPopup(auth, new GoogleAuthProvider());
        const usuario = resultado.user;

        // Primeiro acesso com Google: cria o documento do usuário (mesma estrutura do cadastro)
        try {
            const ref = doc(db, "usuarios", usuario.uid);
            const existente = await getDoc(ref);

            if (!existente.exists()) {
                await setDoc(ref, {
                    nome: usuario.displayName || "",
                    email: usuario.email || "",
                    criadoEm: serverTimestamp()
                });
            }
        } catch (erroFirestore) {
            console.error("Login ok, mas não foi possível salvar o usuário no Firestore:", erroFirestore);
        }

        loginSucesso.classList.add("mostrar");

        setTimeout(function() {
            window.location.href = "../home/home.html";
        }, 1000);

    } catch (erro) {

        loginEmAndamento = false;
        console.error("Erro no login com Google:", erro);

        // Fechar o popup não é erro de verdade
        if (erro.code === "auth/popup-closed-by-user" || erro.code === "auth/cancelled-popup-request") {
            return;
        }

        if (erro.code === "auth/popup-blocked") {
            erroEmail.textContent = "⚠ O navegador bloqueou a janela do Google. Libere pop-ups e tente de novo.";
        } else if (erro.code === "auth/unauthorized-domain") {
            erroEmail.textContent = "⚠ Este domínio não está autorizado no Firebase (Authentication > Settings > Authorized domains).";
        } else if (erro.code === "auth/network-request-failed") {
            erroEmail.textContent = "⚠ Erro de conexão. Verifique sua internet.";
        } else {
            erroEmail.textContent = "⚠ Não foi possível entrar com o Google. Tente novamente.";
        }
    }
});

// Apple exige conta de desenvolvedor Apple paga: fica para uma próxima etapa
botaoApple.addEventListener("click", function() {
    erroEmail.textContent = "Login com Apple em breve.";
});
