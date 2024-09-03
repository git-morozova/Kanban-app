import { getFromStorage, deleteItemFromStorage } from "../utils";
import { closeWindow } from "../app";
import { User } from "../models/User";
import { showAlert } from "../services/render";
import alertTemplate from "../templates/alert.html";

let usersStorage = getFromStorage("users");

export const usersActivator = function () {
  let addInputNode = document.querySelector("#app-users-add");

  //клик по кнопке add
  document
    .querySelector("#app-users-submit")
    .addEventListener("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      clearSelectNodes();
      let newLogin = addInputNode.value;

      if (newLogin == "") {
        document.querySelector("#content").innerHTML += alertTemplate; //шаблон алерта
        showAlert("Login is empty!");
        usersActivator(); //перезагружаем
      } else if (usersStorage.filter((e) => e.login == newLogin)[0]) {
        document.querySelector("#content").innerHTML += alertTemplate; //шаблон алерта
        showAlert("Login already exists!");
        usersActivator(); //перезагружаем
      } else {
        let newUser = new User(addInputNode.value, "12345");
        User.save(newUser);
        usersActivator(); //перезагружаем
      }
    });

  //клик по input для удаления пользователя
  document
    .querySelector(".select-box__value")
    .addEventListener("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      clearSelectNodes();
      usersStorage = getFromStorage("users"); //обновим

      //собираем юзеров для выпадающего списка
      let listInputs = document.querySelector("#app-inputs-delete");
      let listLabels = document.querySelector("#app-labels-delete");

      for (let i = 0; i < usersStorage.length; i++) {
        let login = usersStorage[i].login;
        let id = "delete-option-" + `${i + 1}`;
        let listInput = `
      <div class="select-box__value">
        <input class="select-box__input" type="radio" id="${id}" name="delete">
        <p class="select-box__input-text" id="p-${i + 1}">${login}</p>
      </div>`;
        listInputs.insertAdjacentHTML("beforeend", listInput);

        let listLabel = `
      <li>
        <label class="select-box__option" for="${id}" aria-hidden="aria-hidden">${login}</label>
      </li>`;
        listLabels.insertAdjacentHTML("beforeend", listLabel);
      }

      //клик по кнопке Delete
      document
        .querySelector("#app-users-delete")
        .addEventListener("click", function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();

          let login = "";

          //определяем, какая опция выбрана, т.е. где display присвоен block
          for (let i = 0; i < usersStorage.length; i++) {
            if (document.querySelector("#p-" + `${i + 1}`) == null) return; //убираем баг "parameter is not of type 'Element'""
            var option = document.querySelector("#p-" + `${i + 1}`);
            var pseudo = window.getComputedStyle(
              option,
              "select-box__input-text"
            );

            pseudo.getPropertyValue("display") == "block"
              ? (login = option.innerHTML)
              : false;
          }
          if (login == "") return;
          if (login == "admin") {
            document.querySelector("#content").innerHTML += alertTemplate; //шаблон алерта
            showAlert("Impossible to delete admin!");
            usersActivator(); //перезагружаем
            return;
          }

          let deleteThisUser = usersStorage.filter((e) => e.login == login)[0];
          deleteItemFromStorage(deleteThisUser, "users");
          clearSelectNodes();
          document.querySelector("#content").innerHTML += alertTemplate; //шаблон алерта
          showAlert("Success!");
          usersActivator();
        });
    });

  //подфункция очистки выпадающего списка и тоггл
  const clearSelectNodes = function () {
    let listLabels = document.querySelector("#app-labels-delete");

    listLabels.innerHTML = "";
    let id = "delete-option-0";
    document.querySelector("#app-inputs-delete").innerHTML = `
    <div class="select-box__value">
        <input class="select-box__input" type="radio" id="${id}" name="delete" checked="checked">
        <p class="select-box__input-text">&nbsp;</p>
      </div>`;
  };

  //клик по кнопке "закрыть"
  document
    .querySelector("#app-close-btn")
    .addEventListener("click", function (event) {
      closeWindow(event);
    });
};