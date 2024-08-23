import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import { User } from "./models/User";
import { Task } from "./models/Task";
import { generateTestUser } from "./utils";
import { State } from "./state";
import { authUser, checkStorageAuth } from "./services/auth";
import { hideAuthBlock } from "./services/render";

export const appState = new State();

const loginForm = document.querySelector("#app-login-form");

//проверяем, записан ли юзер при открытии страницы в local storage
//сделано больще для удобства разработки, чтобы не логиниться каждый раз при обновлении страницы
if(checkStorageAuth() == true){
  hideAuthBlock(appState.currentUser);
  document.querySelector("#content").innerHTML = taskFieldTemplate;
} else {
  document.querySelector("#content").innerHTML = noAccessTemplate;
}

//обработчик кнопки "Sign in"
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  generateTestUser(User);

  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");

  //проверка логина и пароля
  if(authUser(login, password)) {
    hideAuthBlock(login); //меняем контент в шапке
    document.querySelector("#content").innerHTML = taskFieldTemplate; //шаблон основного блока - задачи
    console.log("Вход пользователя " + login + ' по Sign in');
  } else {
    document.querySelector("#content").innerHTML = noAccessTemplate; //шаблон основного блока - нет доступа
    console.log("Неверный логин/пароль");
  }
});

const test = new Task('Заг', 'текст');
console.log(test.header);
console.log(test.text);