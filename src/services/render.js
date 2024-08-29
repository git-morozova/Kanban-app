import { DEVNAME, DEVYEAR } from "../globals";
import { getFromStorage } from "../utils";

//запись констант в футер
document.querySelector('#app-devName').innerHTML = DEVNAME;
document.querySelector('#app-devYear').innerHTML = DEVYEAR;

//меняет класс элемента с hidden на visible и обратно
export const elementToggle = function (selector) {
  let element = document.querySelector(selector);
  element.classList.toggle('hidden');
};

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

//Алерт при введении неверного логина/пароля, при введении уже существующего хедера для новой таски
export const showAlert = function (e) {
  document.querySelector("#app-alert-text").innerHTML = e;
}
export const hideAlert = function () {
  document.querySelector('#app-alert').remove()
}

//функция записи в футер кол-ва тасков
export const tasksSum = function () {
  let activeTasksSum = 0;
  let closedTasksSum = 0;
  let storageData = getFromStorage("tasks");

  //выбираем таски backlog и finished
  for (let i = 0; i < storageData.length; i++) {
      if (storageData[i].step == "backlog") {
        activeTasksSum = activeTasksSum + 1;
      }        
      if (storageData[i].step == "finished") {
        closedTasksSum = closedTasksSum + 1;
      }      
  }
  //рендер
  document.querySelector('#app-activeTasksSum').innerHTML = activeTasksSum;
  document.querySelector('#app-closedTasksSum').innerHTML = closedTasksSum;
}

//функция делает disabled для ненужных addCard
export const disabledActivator = function () {
  let storageData = getFromStorage("tasks");
  let ready = document.querySelector('#app-ready');
  let inprogress = document.querySelector('#app-inprogress');
  let finished = document.querySelector('#app-finished');
  
  //обнуляем
  ready.disabled = true;
  inprogress.disabled = true;
  finished.disabled = true;

  //проверяем, есть ли таски в каждом step
  storageData.some(e => e.step === 'backlog') ? ready.disabled = false : false;
  storageData.some(e => e.step === 'ready') ? inprogress.disabled = false : false;
  storageData.some(e => e.step === 'inprogress') ? finished.disabled = false : false;  
}