const formulario = document.getElementById("loginForm");

formulario.addEventListener("submit", function(event) {

     event.preventDefault();

     const email = document.getElementById("email").value;
     const senha = document.getElementById("senha").value;

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

     window.location.href = "../home/home.html";
});

const mostrarSenha = document.getElementById("mostrarSenha");
const senha = document.getElementById("senha");

mostrarSenha.addEventListener("click",function() {
   if(senha.type === "password") {
      senha.type = "text";
      mostrarSenha.clssList.remove("fa-eye");
      mostrarSenha.classList.add("fa-eye-slash");
      }else{
      senha.type = "password";
      mostrarSenha.classList.remove("fa-eye-slash");
      mostrarSenha.classList.add("fa-eye");
      }
});