import { changeStorage, getFromStorage } from "../utils";
import { closeWindow } from "../app";
import { showAlert } from "../services/render";
import alertTemplate from "../templates/alert.html";

let login = getFromStorage("currentUser");
let userStorage = getFromStorage("users").filter(e => e.login == login)[0];

export const profileActivator = function () {
  let loginNode = document.querySelector("#app-profile-login");
  let passInputNode = document.querySelector("#app-profile-pass");
  loginNode.innerHTML = userStorage.login;
  passInputNode.value = userStorage.password;
  
  //клик по кнопке Submit
  document.querySelector('#app-profile-submit').addEventListener('click', function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if(passInputNode.value){
      userStorage.password = passInputNode.value;       
      changeStorage (userStorage, "users");
      closeWindow(event);
    } else {
      document.querySelector("#content").innerHTML += alertTemplate; //шаблон алерта
      showAlert("Password is empty!")
      profileActivator(); //перезагружаем
    }    
  })

  //клик по кнопке "закрыть"
  document.querySelector('#app-close-btn').addEventListener('click', function (event) {
    closeWindow(event);
  })
}