const DEFAULT_DURATION = 5000;

const region = document.getElementById("toast-region");

export function showToast(message, { type = "info", action, duration = DEFAULT_DURATION } = {}) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    const timer = window.setTimeout(() => toast.remove(), duration);
    const dismiss = () => {
        window.clearTimeout(timer);
        toast.remove();
    };

    const text = document.createElement("span");
    text.textContent = message;
    toast.append(text);

    if (action) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "toast-action";
        button.textContent = action.label;
        button.addEventListener("click", () => {
            action.onClick();
            dismiss();
        });
        toast.append(button);
    }

    region.append(toast);
}