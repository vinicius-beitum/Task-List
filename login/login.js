const formulario = document.getElementById("loginForm");

formulario.addEventListener("submit", function(event) {

     event.preventDefault();

     const email = document.getElementById("email").value;
     const senha = document.getElementById("senha").value;

     console.log("Emaii" , email);
     console.log("Senha", senha);

     if(email === ""|| senha === "" ) {
        alert("Prencha todos os campos !")
        
        return;
     }

     if(!email.includes("@")) {
        alert("Digite um Email válido!");
        return;
     }

     if(senha.length < 6 ){
        alert("A senha precisa ter pelomenos 6 caracteres")
        return;
     }

     alert("Login realizado com sucesso !")

     window.location.href = "../home/home.html";
});