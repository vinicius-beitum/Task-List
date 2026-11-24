import { auth, sendPasswordResetEmail } from "../shared/firebase.js";
import { getAuthErrorMessage } from "../shared/auth-errors.js";
import { isValidEmail } from "../shared/validation.js";
import {
    clearErrorOnInput,
    hideFormAlert,
    setButtonLoading,
    showFieldError,
    showFormAlert
} from "../shared/form-ui.js";

const REMEMBERED_EMAIL_KEY = "taskflow:remembered-email";
const ERRORS_TO_REPORT = new Set(["auth/network-request-failed", "auth/too-many-requests"]);

const form = document.getElementById("recover-form");
const emailInput = form.elements.email;
const submitButton = form.querySelector("[type=submit]");
const formAlert = document.getElementById("form-alert");

async function handleSubmit(event) {
    event.preventDefault();
    hideFormAlert(formAlert);

    const email = emailInput.value.trim();

    if (!email) {
        showFieldError(emailInput, "Digite seu e-mail.");
        return;
    }
    if (!isValidEmail(email)) {
        showFieldError(emailInput, "Digite um e-mail válido.");
        return;
    }

    setButtonLoading(submitButton, true, "Enviando…");

    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Falha ao enviar o e-mail de recuperação:", error);

        // Outros erros (como e-mail sem conta) caem na mensagem genérica de sucesso,
        // para não revelar quais e-mails estão cadastrados.
        if (ERRORS_TO_REPORT.has(error.code)) {
            showFormAlert(formAlert, getAuthErrorMessage(error));
            setButtonLoading(submitButton, false);
            return;
        }
    }

    showFormAlert(
        formAlert,
        `Se ${email} estiver cadastrado, você vai receber um link em instantes. Confira também o spam.`,
        "success"
    );
    setButtonLoading(submitButton, false);
    submitButton.textContent = "Reenviar link";
}

try {
    if (!emailInput.value) emailInput.value = localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
} catch {
    // localStorage indisponível: o campo apenas começa vazio.
}

form.addEventListener("submit", handleSubmit);
clearErrorOnInput(emailInput);