const loginForm = document.querySelector("#loginForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#senha");
const rememberInput = document.querySelector("#lembrar");
const passwordToggle = document.querySelector("#mostrarSenha");

const savedEmail = localStorage.getItem("email");
if (savedEmail) {
    emailInput.value = savedEmail;
    rememberInput.checked = true;
}

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Preencha seu e-mail e sua senha.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Digite um e-mail válido.");
        return;
    }

    if (rememberInput.checked) {
        localStorage.setItem("email", email);
    } else {
        localStorage.removeItem("email");
    }

    window.location.href = "../home/home.html";
});

passwordToggle?.addEventListener("click", () => {
    const showingPassword = passwordInput.type === "text";
    passwordInput.type = showingPassword ? "password" : "text";
    passwordToggle.classList.toggle("fa-eye", showingPassword);
    passwordToggle.classList.toggle("fa-eye-slash", !showingPassword);
});
