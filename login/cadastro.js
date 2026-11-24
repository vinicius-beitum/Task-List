import { auth, createUserWithEmailAndPassword, updateProfile } from "../shared/firebase.js";
import { getAuthErrorMessage } from "../shared/auth-errors.js";
import { checkPassword, isValidEmail, PASSWORD_RULES, PASSWORD_STRENGTH_LABELS } from "../shared/validation.js";
import {
    clearErrorOnInput,
    hideFormAlert,
    setButtonLoading,
    setupDialogs,
    setupPasswordToggle,
    showFieldError,
    showFormAlert
} from "../shared/form-ui.js";

const HOME_URL = "../home/home.html";

const form = document.getElementById("signup-form");
const {
    name: nameInput,
    email: emailInput,
    password: passwordInput,
    passwordConfirmation: confirmationInput,
    terms: termsInput
} = form.elements;
const submitButton = form.querySelector("[type=submit]");
const formAlert = document.getElementById("form-alert");
const strengthMeter = document.getElementById("password-strength");
const strengthLabel = document.getElementById("password-strength-label");
const rulesList = document.getElementById("password-rules");

function renderPasswordRules() {
    const items = PASSWORD_RULES.map((rule) => {
        const item = document.createElement("li");
        item.dataset.rule = rule.id;
        item.innerHTML = '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i>';
        item.append(rule.label);
        return item;
    });
    rulesList.replaceChildren(...items);
}

function updatePasswordFeedback() {
    const password = passwordInput.value;
    const { results, score } = checkPassword(password);

    strengthMeter.hidden = password.length === 0;
    strengthMeter.dataset.score = String(score);
    strengthLabel.textContent = PASSWORD_STRENGTH_LABELS[score];

    results.forEach((rule) => {
        const item = rulesList.querySelector(`[data-rule="${rule.id}"]`);
        const icon = item.querySelector("i");
        item.classList.toggle("is-valid", rule.passed);
        icon.classList.toggle("fa-circle-check", rule.passed);
        icon.classList.toggle("fa-circle-xmark", !rule.passed);
    });
}

function validate({ name, email, password, confirmation }) {
    if (!name) {
        showFieldError(nameInput, "Digite seu nome.");
        return false;
    }
    if (!email) {
        showFieldError(emailInput, "Digite seu e-mail.");
        return false;
    }
    if (!isValidEmail(email)) {
        showFieldError(emailInput, "Digite um e-mail válido.");
        return false;
    }

    const passwordCheck = checkPassword(password);
    if (!passwordCheck.isValid) {
        showFieldError(passwordInput, passwordCheck.error);
        return false;
    }
    if (!confirmation) {
        showFieldError(confirmationInput, "Confirme sua senha.");
        return false;
    }
    if (confirmation !== password) {
        showFieldError(confirmationInput, "As senhas não são iguais.");
        return false;
    }
    if (!termsInput.checked) {
        showFieldError(termsInput, "Aceite os termos para continuar.");
        return false;
    }
    return true;
}

async function handleSubmit(event) {
    event.preventDefault();
    hideFormAlert(formAlert);

    const values = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        confirmation: confirmationInput.value
    };

    if (!validate(values)) return;

    setButtonLoading(submitButton, true, "Criando conta…");

    try {
        const { user } = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await updateProfile(user, { displayName: values.name });
        window.location.replace(HOME_URL);
    } catch (error) {
        console.error("Falha no cadastro:", error);
        setButtonLoading(submitButton, false);

        if (error.code === "auth/email-already-in-use") {
            showFieldError(emailInput, "Este e-mail já está cadastrado. Tente fazer login.");
            return;
        }
        showFormAlert(formAlert, getAuthErrorMessage(error, "Não foi possível criar sua conta. Tente novamente."));
    }
}

form.addEventListener("submit", handleSubmit);
passwordInput.addEventListener("input", updatePasswordFeedback);

clearErrorOnInput(nameInput, emailInput, passwordInput, confirmationInput, termsInput);
form.querySelectorAll(".field-action").forEach(setupPasswordToggle);
setupDialogs();
renderPasswordRules();