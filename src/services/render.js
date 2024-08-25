
//Замена блока аутентификации на блок с приветствием (в шапке)
const loginForm = document.querySelector("#app-login-form");
export const toggleAuthBlock = function (login) {
  loginForm.classList.toggle('hidden') //скрываем блок аутентификации
  document.querySelector("#app-userName").classList.toggle('hidden') //отображаем блок для приветствия в шапке
  document.querySelector("#app-userNameValue").innerHTML = login; //вставляем имя в этот блок
  document.querySelector("#app-menu").classList.toggle('hidden') //отображаем меню
}

//Замена контента в футере
export const toggleFooter = function () {
  document.querySelector("#app-footer").classList.toggle('hidden')
}

//изменение стрелки в выпадающем верхнем меню при клике
export const navArrowToggle = function () {
  document.querySelector("#app-nav-arrow").classList.toggle('arrow-dwn');
  document.querySelector("#app-nav-arrow").classList.toggle('arrow-up');
}