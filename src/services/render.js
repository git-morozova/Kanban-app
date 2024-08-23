
//Замена блока аутентификации на блок с приветствием (в шапке)
const loginForm = document.querySelector("#app-login-form");

export const hideAuthBlock = function (login) {
  loginForm.className = 'hidden' //скрываем блок аутентификации
  document.querySelector("#app-userName").className = 'visible' //отображаем блок для приветствия в шапке
  document.querySelector("#app-userNameValue").innerHTML = login; //вставляем имя в этот блок
}
