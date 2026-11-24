function getErrorElement(input) {
    return document.getElementById(`${input.id}-error`);
}

export function shake(element) {
    element.classList.remove("is-shaking");
    void element.offsetWidth;
    element.classList.add("is-shaking");
}

export function showFieldError(input, message) {
    getErrorElement(input).textContent = message;
    input.setAttribute("aria-invalid", "true");
    shake(input.closest(".field") ?? input);
    input.focus();
}

export function clearFieldError(input) {
    getErrorElement(input).textContent = "";
    input.removeAttribute("aria-invalid");
}

export function clearErrorOnInput(...inputs) {
    inputs.forEach((input) => {
        const eventName = input.type === "checkbox" ? "change" : "input";
        input.addEventListener(eventName, () => clearFieldError(input));
    });
}

export function showFormAlert(alertElement, message, type = "error") {
    alertElement.textContent = message;
    alertElement.dataset.type = type;
    alertElement.hidden = false;
}

export function hideFormAlert(alertElement) {
    alertElement.hidden = true;
    alertElement.textContent = "";
}

export function setButtonLoading(button, isLoading, loadingText = "Aguarde…") {
    if (isLoading) {
        button.dataset.label = button.textContent;
        button.textContent = loadingText;
    } else if (button.dataset.label) {
        button.textContent = button.dataset.label;
    }

    button.disabled = isLoading;
    button.setAttribute("aria-busy", String(isLoading));
}

export function setupPasswordToggle(button) {
    const input = document.getElementById(button.getAttribute("aria-controls"));
    const icon = button.querySelector("i");

    button.addEventListener("click", () => {
        const willShow = input.type === "password";

        input.type = willShow ? "text" : "password";
        button.setAttribute("aria-pressed", String(willShow));
        button.setAttribute("aria-label", willShow ? "Ocultar senha" : "Mostrar senha");
        icon.classList.toggle("fa-eye", !willShow);
        icon.classList.toggle("fa-eye-slash", willShow);
    });
}

export function setupCapsLockWarning(input, warning) {
    const update = (event) => {
        warning.hidden = !event.getModifierState?.("CapsLock");
    };

    input.addEventListener("keydown", update);
    input.addEventListener("keyup", update);
    input.addEventListener("blur", () => { warning.hidden = true; });
}

export function setupDialogs(root = document) {
    root.querySelectorAll("[data-open-dialog]").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            document.getElementById(trigger.dataset.openDialog).showModal();
        });
    });

    root.querySelectorAll("dialog").forEach((dialog) => {
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) dialog.close();
        });
    });
}