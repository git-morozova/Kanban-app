import { DEVNAME, DEVYEAR } from "../globals";

//запись констант в футер
document.querySelector('#app-devName').innerHTML = DEVNAME;
document.querySelector('#app-devYear').innerHTML = DEVYEAR;

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

//отображение и скрытие выпадающего меню справа вверху, включая стрелки
//toggle нельзя использовать, так как нужно обработать событие клика в любом месте страницы
export const navArrowShow = function () {
  document.querySelector("#app-nav-arrow").classList.remove('arrow-dwn');
  document.querySelector("#app-nav-arrow").classList.add('arrow-up');
  document.querySelector("#app-nav-arrow-cloud").classList.remove('hidden');
}
export const navArrowHide = function () {
  document.querySelector("#app-nav-arrow").classList.remove('arrow-up');
  document.querySelector("#app-nav-arrow").classList.add('arrow-dwn');
  document.querySelector("#app-nav-arrow-cloud").classList.add('hidden');
}

//Алерт при введении неверного логина/пароля
export const showAlert = function (e) {
  document.querySelector("#app-alert-text").innerHTML = e;
}
export const hideAlert = function () {
  document.querySelector('#app-alert').remove()
}
