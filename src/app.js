import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/bootstrap.bundle.min.js";
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import pleaseSignInTemplate from "./templates/pleaseSignIn.html";

import { User } from "./models/User";
import { Task } from "./models/Task";
import { generateTestUser, removeFromStorage} from "./utils";
import { State } from "./state";
import { authUser, checkStorageAuth } from "./services/auth";
import { toggleAuthBlock, toggleFooter, navArrowToggle } from "./services/render";
import { DEVNAME, DEVYEAR } from "./globals";

export const appState = new State();
const loginForm = document.querySelector("#app-login-form");
let mainContent = document.querySelector("#content");

//запись констант в футер
document.querySelector('#app-devName').innerHTML = DEVNAME;
document.querySelector('#app-devYear').innerHTML = DEVYEAR;

//проверяем, записан ли юзер при открытии страницы в local storage
//сделано больще для удобства разработки, чтобы не логиниться каждый раз при обновлении страницы
//на бою можно использовать appState
if(checkStorageAuth() == true){
  toggleAuthBlock(appState.currentUser); //меняем контент в шапке
  toggleFooter(); //меняем контент в подвале
  mainContent.innerHTML = taskFieldTemplate; //шаблон основного блока: задачи
} else {
  mainContent.innerHTML = pleaseSignInTemplate; //шаблон основного блока: пожалуйста, залогиньтесь
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
    toggleAuthBlock(login); //меняем контент в шапке
    toggleFooter(); //меняем контент в подвале
    mainContent.innerHTML = taskFieldTemplate; //шаблон основного блока: задачи
    console.log("Вход пользователя " + login + ' по Sign in');
  } else {
    mainContent.innerHTML = noAccessTemplate; //шаблон основного блока: нет доступа
    console.log("Неверный логин/пароль");
  }
});


//обработчик кнопки "Log Out"
const logOutButton = document.querySelector('#app-logout-btn');

logOutButton.addEventListener('click', function (event) {
  event.preventDefault();
  toggleAuthBlock(); //меняем контент в шапке
  toggleFooter(); //меняем контент в подвале
  removeFromStorage("currentUser");
  mainContent.innerHTML = pleaseSignInTemplate; //шаблон основного блока: пожалуйста, залогиньтесь
})

//обработчик стрелки верхнего выпадающего меню, используем id из bootstrap
document.querySelector("#navbarDarkDropdownMenuLink").addEventListener("click", function (event) {
  event.preventDefault();
  navArrowToggle();
})

const test = new Task('Заг', 'текст');
console.log(test.header);
console.log(test.text);
