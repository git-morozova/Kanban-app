import "./styles/style.css";
import "./styles/adaptive.css";

import taskFieldTemplate from "./templates/taskField.html";
import pleaseSignInTemplate from "./templates/pleaseSignIn.html";
import alertTemplate from "./templates/alert.html";
import editUsersTemplate from "./templates/pages/editUsers.html";
import profileTemplate from "./templates/pages/profile.html";

import { User } from "./models/User";
import { Task } from "./models/Task";
import { State } from "./state";

import { generateTestUser, generateTestTasks, addToStorage, changeStorage, getFromStorage } from "./utils";
import { authUser, checkStorageAuth } from "./services/auth";
import { toggleAuthBlock, toggleFooter, navArrowShow, navArrowHide, showAlert, hideAlert, tasksSum, changeMenuItems } from "./services/render";
import { showUserTasks } from "./services/tasks";
import { profileActivator } from "./services/profile";
import { usersActivator } from "./services/users";

export const appState = new State();
const loginForm = document.querySelector("#app-login-form");
let mainContent = document.querySelector("#content");

//при обращении к странице проверяем, записан ли currentUser в local storage
if (checkStorageAuth() == true) {
  toggleAuthBlock(appState.currentUser); //меняем контент в шапке
  toggleFooter(); //меняем контент в подвале
  changeMenuItems(); //меняем пункты меню в зависимости от прав пользователя
  tasksSum(); //пишем в футер кол-во тасков

  //чтобы не выкидывало на главную при обновлении страниц - profile и users
  if (getFromStorage("currentPage") == "profile") {
    mainContent.innerHTML = profileTemplate; //шаблон основного блока: profile
    profileActivator();
  } else if (getFromStorage("currentPage") == "editUsers") {
    mainContent.innerHTML = editUsersTemplate; //шаблон основного блока: editUsers
    usersActivator();
  } else {
    mainContent.innerHTML = taskFieldTemplate; //шаблон основного блока: задачи
    showUserTasks(appState.currentUser); //рендер всех тасков юзера на доске
  }
} else {
  mainContent.innerHTML = pleaseSignInTemplate; //шаблон основного блока: пожалуйста, залогиньтесь
  changeStorage("pleaseSignIn", "currentPage"); //запишем в local storage текущую страницу
}

//обработчик кнопки "Sign in"
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  localStorage.clear();
  generateTestUser(User);
  generateTestTasks(Task);

  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");

  //проверка логина и пароля
  if (authUser(login, password)) {
    addToStorage(login, "currentUser"); //запишем в local storage текущего пользователя
    changeStorage("taskField", "currentPage"); //запишем в local storage текущую страницу
    toggleAuthBlock(login); //меняем контент в шапке
    toggleFooter(); //меняем контент в подвале
    changeMenuItems(); //меняем пункты меню в зависимости от прав пользователя
    console.log("Вход пользователя " + login + " по Sign in");
    mainContent.innerHTML = taskFieldTemplate; //шаблон основного блока: задачи
    showUserTasks(login); //рендер всех тасков юзера на доске
    tasksSum(); //пишем в футер кол-во тасков
  } else {
    mainContent.innerHTML += alertTemplate; //шаблон алерта
    showAlert("Sorry, you've no access to this resource!");
    console.log("Неверный логин/пароль");
    localStorage.clear();
    changeStorage("pleaseSignIn", "currentPage"); //запишем в local storage текущую страницу
  }
});

//обработчик кнопки "Log Out"
const logOutButton = document.querySelector("#app-logout-btn");

logOutButton.addEventListener("click", function (event) {
  event.preventDefault();
  toggleAuthBlock(); //меняем контент в шапке
  toggleFooter(); //меняем контент в подвале
  localStorage.clear();
  mainContent.innerHTML = pleaseSignInTemplate; //шаблон основного блока: пожалуйста, залогиньтесь
  changeStorage("pleaseSignIn", "currentPage"); //запишем в local storage текущую страницу
});

//обработчик верхнего выпадающего меню
//используем window, т.к. юзер может кликнуть в любом месте, чтобы закрыть меню
//проверяем, какие стрелки нужно отобразить, через список пунктов меню из bootstrap
window.addEventListener("click", function () {
  document.querySelector("#app-menu-cloud").classList.contains("show")
    ? navArrowShow() //меню показывается, значит стрелка справа от аватара - вверх, а белый треугольник для облака меню нужен
    : navArrowHide(); //стрелка аватара вниз, треугольник для облака не нужен
});

//обработчик алерта
//опять нужен из-за того, что юзер может кликнуть в любом месте, чтобы закрыть всплывающее окно
window.addEventListener("click", function () {
  document.querySelector("#app-alert") != null ? hideAlert() : false;
});

//клик по кнопке "закрыть"
export const closeWindow = function (event) {
  event.preventDefault();
  document.querySelector("#content").innerHTML = taskFieldTemplate; //шаблон основного блока: задачи
  changeStorage("taskField", "currentPage"); //запишем в local storage текущую страницу
  showUserTasks(getFromStorage("currentUser")); //рендер всех тасков юзера на доске
};