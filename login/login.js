import {
    auth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "../shared/firebase.js";
import { getAuthErrorMessage, isSilentAuthError } from "../shared/auth-errors.js";
import { isValidEmail } from "../shared/validation.js";
import {
    clearErrorOnInput,
    hideFormAlert,
    setButtonLoading,
    setupCapsLockWarning,
    setupPasswordToggle,
    showFieldError,
    showFormAlert
} from "../shared/form-ui.js";

const HOME_URL = "../home/home.html";
const REMEMBERED_EMAIL_KEY = "taskflow:remembered-email";

const form = document.getElementById("login-form");
const { email: emailInput, password: passwordInput, remember: rememberInput } = form.elements;
const submitButton = form.querySelector("[type=submit]");
const googleButton = document.getElementById("google-sign-in");
const formAlert = document.getElementById("form-alert");
const title = document.getElementById("login-title");
const rememberedEmailText = document.getElementById("remembered-email");
const switchAccountButton = document.getElementById("switch-account");

const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    if (user) goHome();
});

function goHome() {
    window.location.replace(HOME_URL);
}

function readRememberedEmail() {
    try {
        return localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
    } catch {
        return "";
    }
}

function saveRememberedEmail(email, shouldRemember) {
    try {
        if (shouldRemember) localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    } catch {
        // Navegação privada pode bloquear o localStorage; o login continua funcionando.
    }
}

function renderRememberedAccount(email) {
    const hasAccount = Boolean(email);

    title.textContent = hasAccount ? "Olá de novo" : "Entrar na sua conta";
    rememberedEmailText.textContent = email;
    rememberedEmailText.hidden = !hasAccount;
    switchAccountButton.hidden = !hasAccount;
    rememberInput.checked = hasAccount;

    if (hasAccount) {
        emailInput.value = email;
        passwordInput.focus();
    }
}

function getPersistence() {
    return rememberInput.checked ? browserLocalPersistence : browserSessionPersistence;
}

function validate(email, password) {
    if (!email) {
        showFieldError(emailInput, "Digite seu e-mail.");
        return false;
    }
    if (!isValidEmail(email)) {
        showFieldError(emailInput, "Digite um e-mail válido.");
        return false;
    }
    if (!password) {
        showFieldError(passwordInput, "Digite sua senha.");
        return false;
    }
    return true;
}

async function handleSubmit(event) {
    event.preventDefault();
    hideFormAlert(formAlert);

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!validate(email, password)) return;

    setButtonLoading(submitButton, true, "Entrando…");

    try {
        await setPersistence(auth, getPersistence());
        await signInWithEmailAndPassword(auth, email, password);
        saveRememberedEmail(email, rememberInput.checked);
        goHome();
    } catch (error) {
        console.error("Falha no login:", error);
        showFormAlert(formAlert, getAuthErrorMessage(error, "Não foi possível entrar. Tente novamente."));
        setButtonLoading(submitButton, false);
    }
}

async function handleGoogleSignIn() {
    hideFormAlert(formAlert);
    googleButton.disabled = true;

    try {
        await setPersistence(auth, getPersistence());
        await signInWithPopup(auth, new GoogleAuthProvider());
        goHome();
    } catch (error) {
        googleButton.disabled = false;
        if (isSilentAuthError(error)) return;

        if (error.code === "auth/unauthorized-domain") {
            console.error("Adicione este domínio em Firebase > Authentication > Settings > Authorized domains.");
        }
        console.error("Falha no login com Google:", error);
        showFormAlert(formAlert, getAuthErrorMessage(error, "Não foi possível entrar com o Google."));
    }
}

form.addEventListener("submit", handleSubmit);
googleButton.addEventListener("click", handleGoogleSignIn);

emailInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !passwordInput.value) {
        event.preventDefault();
        passwordInput.focus();
    }
});

switchAccountButton.addEventListener("click", () => {
    saveRememberedEmail("", false);
    renderRememberedAccount("");
    emailInput.value = "";
    emailInput.focus();
});

clearErrorOnInput(emailInput, passwordInput);
setupPasswordToggle(form.querySelector("[aria-controls=password]"));
setupCapsLockWarning(passwordInput, document.getElementById("caps-lock-warning"));
const rememberedEmail = readRememberedEmail();
if (rememberedEmail && !emailInput.value) renderRememberedAccount(rememberedEmail);