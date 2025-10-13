function login() {
  const usuario = document.getElementById("usuario").value;
  const usuariosPermitidos = ["admin", "teste"];

  if (usuariosPermitidos.includes(usuario)) {
    const userType = usuario === 'admin' ? 'ADMINISTRADOR' : 'TESTE';
    window.location.href = `pages/painel.html?user=${userType}`;
  } else {
    alert("Selecione um usuário válido!");
  }
}

// Enter para login
document.getElementById("usuario").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    login();
  }
});