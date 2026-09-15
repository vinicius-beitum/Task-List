const formulario = document.getElementById("loginForm");

     const email = document.getElementById("email");
     const senha = document.getElementById("senha");
     const lembrar = document.getElementById("lembrar");
     const mostrarSenha = document.getElementById("mostrarSenha");

window.addEventListener("load", function() {

   const emailSalvo = localStorage.getItem("email");
   if(emailSalvo) {
      email.value = emailSalvo;
      lembrar.checked = true;
   }
});


formulario.addEventListener("submit", function(event) {

     event.preventDefault();

     const emailDigitado = email.value
     const senhaDigitada = senha.value

// verificação de email e senha
     
   if(email === "") {
      alert("Digite seu e-mail.");
      return;
   }

   if(senha === "") {
      alert("Digite sua senha.");
      return;
   }

//Validacão do formato do email
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if(!emailRegex.test(email)) {
      alert("Digite um email válido.");
      return;
   }

//Validacao do tamanho da senha

if (senha.length <= 3) {
    alert("A senha deve ter mais de 4 caracteres!");
    return;
}

if (!/[A-Z]/.test(senha)) {
    alert("A senha deve conter pelo menos uma letra maiúscula!");
    return;
}

if (!/[a-z]/.test(senha)) {
    alert("A senha deve conter pelo menos uma letra minúscula!");
    return;
}

if (!/[0-9]/.test(senha)) {
    alert("A senha deve conter pelo menos um número!");
    return;
}

if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(senha)) {
    alert("A senha deve conter pelo menos um caractere especial!");
    return;
}

if (lembrar.checked) {
   localStorage.setItem("email", email);
} else {
   localStorage.removeItem("email");
}


     window.location.href = "../home/home.html";
});

// Mostrar e ocultar senha

const mostrarSenha = document.getElementById("mostrarSenha");

mostrarSenha.addEventListener("click", function() {
   if(senhaInput.type === "password") {
      senhaInput.type = "text";
      mostrarSenha.classList.remove("fa-eye");
      mostrarSenha.classList.add("fa-eye-slash");

   }else{
      
      senhaInput.type = "password";
      mostrarSenha.classList.remove("fa-eye-slash");
      mostrarSenha.classList.add("fa-eye");
   }
});
