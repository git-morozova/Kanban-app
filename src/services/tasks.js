import { getFromStorage, changeStorage, deleteItemFromStorage } from "../utils";
import { Task } from "../models/Task";
import { disabledActivator, tasksSum, showAlert, elementToggle } from "../services/render";
import { closeWindow } from "../app";

import alertTemplate from "../templates/alert.html";
import editTaskTemplate from "../templates/pages/editTask.html";

let storageData = getFromStorage("tasks");
let allTasksArr = []; //для функции редактирования каждой таски, будем туда динамически добавлять ноды с тасками

//вспомогательная функция - рендер одного таска
const renderTask = function (id) {
  let task = storageData.filter((e) => e.id === id)[0];

  let a = document.createElement("a");
  a.className = "tasks-col__item-task bg-white";
  a.textContent = task.header;

  let div = document.createElement("div");
  div.className = "tasks-col__item app-task";
  div.id = "id-" + `${id}`;

  if (task.step !== "finished") {
    div.setAttribute("draggable", "true");
    div.ondragstart = dragstart_handler;
    div.ondragend = dragend_handler;
  }
  
  let node = document.querySelector("#app-" + `${task.step}` + "-items"); 
  node.insertAdjacentElement("beforeend", div);
  div.insertAdjacentElement("afterbegin", a);

  //обычный пользователь видит только заголовки тасков
  //админу также показываем, какой пользователь прикреплен к каждому таску
  if (getFromStorage("currentUser") == "admin") {
    let userBadge = document.createElement("a");

    userBadge.className = "tasks-col__item-badge shape";
    userBadge.textContent = task.login;
    div.insertAdjacentElement("afterbegin", userBadge);
  }
};

//вспомогательная функция - меняет step для таски
const changeStep = function (header, step) {
  let tempTask = storageData.filter((e) => e.header === header)[0];
  tempTask.step = step;

  changeStorage(tempTask, "tasks");
  deleteTask(tempTask.id);

  renderTask(tempTask.id);
  disabledActivator();
  tasksSum();
  allTasksArr = updTaskNodes(); //обновим
};

//вспомогательная функция - убрать из DOM один таск
const deleteTask = function (id) {
  let taskNode = document.querySelector("#id-" + `${id}`);
  taskNode.remove();
};

//рендер всех тасков (4 колонки)
//заполняем колонки снизу вверх, чтобы сохранить порядок: сверху старые таски
export const showUserTasks = function () {
  storageData = getFromStorage("tasks");

  const renderTasks = (currentStep) => {
    document.querySelector("#app-" + `${currentStep}` + "-items").innerHTML =
      ""; //очистка доски
    for (let i = 0; i < storageData.length; i++) {
      if (storageData[i].step == currentStep) {
        renderTask(storageData[i].id);
      }
    }
  };
  renderTasks("backlog");
  renderTasks("ready");
  renderTasks("inprogress");
  renderTasks("finished");

  //добавляем функции кнопок только после того, как они появятся в DOM
  backlogActivator();
  addInputsActivator();
  disabledActivator();

  allTasksArr = updTaskNodes(); //обновим
    
  //для drag and drop
  document.querySelector("#app-ready-col").ondrop = drop_handler;
  document.querySelector("#app-ready-col").ondragover = dragover_handler;
  document.querySelector("#app-inprogress-col").ondrop = drop_handler;
  document.querySelector("#app-inprogress-col").ondragover = dragover_handler;
  document.querySelector("#app-finished-col").ondrop = drop_handler;
  document.querySelector("#app-finished-col").ondragover = dragover_handler;
};

//клик по кнопке addCard в колонке backlog
const backlogActivator = function () {
  let addBtn = document.querySelector("#app-backlog");

  addBtn.addEventListener("click", function (event) {
    event.preventDefault();
    elementToggle("#app-backlog");
    elementToggle("#app-backlog-submit");

    let input = document.querySelector("#app-backlog-input");
    elementToggle("#app-backlog-input");
    input.value = "";
    input.focus();

    //клик по кнопке Submit или в любом месте кроме поля инпута
    input.onblur = function (event) {
      event.preventDefault();      

      let newTask = new Task(getFromStorage("currentUser")[0], "backlog", input.value, "no description");

      elementToggle("#app-backlog");
      elementToggle("#app-backlog-submit");
      elementToggle("#app-backlog-input");

      if (input.value) {
        if (storageData.some((e) => e.header === input.value)) {
          //задача с таким заголовком уже существует
          document.querySelector("#content").innerHTML += alertTemplate; //шаблон алерта
          showAlert("Task with this header already exists");
        } else {
          Task.save(newTask);

          storageData = getFromStorage("tasks"); //надо переписать с новой таской
          let i = storageData.length - 1;

          renderTask(storageData[i].id);
          tasksSum(); //пересчет активных тасков
        }        
        showUserTasks(); //перезагружаем функции: без этого почему-то все ломается
      }
    };
  });
};

//активируем функции для кнопок add Card в колонках ready, inprogress и finished + dragAndDrop
const addInputsActivator = function () {
  columnActivator("ready");
  columnActivator("inprogress");
  columnActivator("finished"); 
};

//клик по кнопке addCard в колонках ready, inprogress и finished
const columnActivator = function (column) {
  let addBtn = document.querySelector("#app-" + `${column}`);
  let submitNode = document.querySelector("#app-" + `${column}` + "-submit");

  addBtn.addEventListener("click", function (event) {
    event.stopImmediatePropagation(); //исправляем баг с двойным кликом из-за вложенности элементов (StackOverflow)
    event.preventDefault();

    elementToggle("#app-" + `${column}`);
    elementToggle("#app-" + `${column}` + "-submit");
    elementToggle("#app-select-" + `${column}`);

    //заполним выпадающий список тасками из левой колонки
    let leftColumnName = "";
    column == "ready" ? (leftColumnName = "backlog") : "";
    column == "inprogress" ? (leftColumnName = "ready") : "";
    column == "finished" ? (leftColumnName = "inprogress") : "";

    storageData = getFromStorage("tasks"); //обновим

    storageData = storageData.filter((e) => e.step === leftColumnName);
    let listInputs = document.querySelector("#app-inputs-" + `${column}`);
    let listLabels = document.querySelector("#app-labels-" + `${column}`);

    for (let i = 0; i < storageData.length; i++) {
      let id = `${column}` + "-option-" + `${i + 1}`;
      let listInput = `
      <div class="select-box__value">
        <input class="select-box__input" type="radio" id="${id}" name="${column}">
        <p class="select-box__input-text" id="p-${column}${i + 1}">${
        storageData[i].header
      }</p>
      </div>`;
      listInputs.insertAdjacentHTML("beforeend", listInput);

      let listLabel = `
      <li>
        <label class="select-box__option" for="${id}" aria-hidden="aria-hidden">${storageData[i].header}</label>
      </li>`;
      listLabels.insertAdjacentHTML("beforeend", listLabel);
    }

    //клик по кнопке Submit
    submitNode.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      let header = "";

      //определяем, какая опция выбрана, т.е. где display присвоен block
      for (let i = 0; i < storageData.length; i++) {
        if (document.querySelector("#p-" + `${column}${i + 1}`) === null)
          return; //убираем баг "parameter is not of type 'Element'""
        var option = document.querySelector("#p-" + `${column}${i + 1}`);
        var pseudo = window.getComputedStyle(option, "select-box__input-text");
        pseudo.getPropertyValue("display") == "block"
          ? (header = option.innerHTML)
          : false;
      }
      if (header == "") return;

      changeStep(header, column); //перекидываем таску из левой колонки в правую
      clearSelectNodes();

      allTasksArr = updTaskNodes(); //обновим
    });
  });

  //подфункция очистки выпадающего списка и тоггл
  const clearSelectNodes = function () {
    let listLabels = document.querySelector("#app-labels-" + `${column}`);
    elementToggle("#app-" + `${column}`);
    elementToggle("#app-" + `${column}` + "-submit");
    elementToggle("#app-select-" + `${column}`);

    listLabels.innerHTML = "";
    let id = `${column}` + "-option-0";
    document.querySelector("#app-inputs-" + `${column}`).innerHTML = `
    <div class="select-box__value">
        <input class="select-box__input" type="radio" id="${id}" name="${column}" checked="checked">
        <p class="select-box__input-text">&nbsp;</p>
      </div>`;
  };

  //возвращаем кнопку add card при клике вне колонки
  window.addEventListener("click", function (e) {
    var tasksContainer = document.querySelector(".tasks");
    if (tasksContainer) {
      var boxNode = tasksContainer.children;
      if (!submitNode.classList.contains("hidden")) {
        var i = "";
        column == "ready" ? (i = 1) : "";
        column == "inprogress" ? (i = 2) : "";
        column == "finished" ? (i = 3) : "";

        !boxNode[i].contains(e.target) ? clearSelectNodes() : false;
      }
    }
  });
};

//функция обновляет nodeList с тасками
const updTaskNodes = function () {
  let allTasksCollection = document.getElementsByClassName("app-task"); //тут нельзя через querySelector
  allTasksArr = Array.from(allTasksCollection); //надо преобразовать в массив, чтобы сработал forEach

  //addEventListener для редактирования таска
  allTasksArr.forEach((task) => {
    //вешаем обработчик на каждый div с таском
    task.addEventListener("click", function editTask(event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      let id = task.getAttribute("id").replace("id-", "");

      document.querySelector("#content").innerHTML = editTaskTemplate; //шаблон основного блока: editTask
      changeStorage("editTask", "currentPage");
      let headerNode = document.querySelector("#app-task-header");
      let textNode = document.querySelector("#app-task-text");

      //маневры внутри страницы редактирования таски
      let taskStorage = getFromStorage("tasks").filter((e) => e.id === id)[0];
      headerNode.innerHTML = taskStorage.header;
      textNode.innerHTML = taskStorage.text;

      //инпут для header
      headerNode.addEventListener("click", function (event) {
        event.preventDefault();
        let newTag = document.createElement("input");

        newTag.setAttribute("type", "text");
        if (headerNode.innerHTML == taskStorage.header) {
          newTag.setAttribute("value", taskStorage.header);
        } else {
          newTag.setAttribute("value", headerNode.innerHTML);
        }
        newTag.setAttribute("id", "app-header-input");
        newTag.setAttribute("class", "header-input");
        headerNode.innerHTML = "";
        headerNode.insertAdjacentElement("afterend", newTag);
        newTag.focus();

        //клик вне инпута - возвращает h2
        newTag.onblur = function (event) {
          event.preventDefault();
          if (newTag.value) {
            headerNode.blur();
            headerNode.innerHTML =
              document.querySelector("#app-header-input").value;
            newTag.parentNode.removeChild(newTag);
          }
        };
      });

      //инпут для text
      textNode.addEventListener("click", function (event) {
        event.preventDefault();

        let newTag = document.createElement("textarea");
        newTag.setAttribute("id", "app-text-input");
        newTag.setAttribute("class", "form-control text-input");

        let text = taskStorage.text;
        newTag.setAttribute("value", text);

        if (textNode.innerHTML == text) {
          newTag.innerHTML = text;
        } else {
          newTag.innerHTML = textNode.innerHTML;
        }

        textNode.innerHTML = "";
        textNode.insertAdjacentElement("afterend", newTag);
        newTag.focus();

        //клик вне инпута - возвращает p
        newTag.onblur = function (event) {
          event.preventDefault();
          textNode.blur();
          if (document.querySelector("#app-text-input").value !== "") {
            textNode.innerHTML =
              document.querySelector("#app-text-input").value;
          } else {
            textNode.innerHTML = "no description";
          }
          newTag.parentNode.removeChild(newTag);
        };
      });

      //клик по кнопке Save
      document
        .querySelector("#app-task-submit")
        .addEventListener("click", function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();

          taskStorage.header = headerNode.innerHTML;
          changeStorage(taskStorage, "tasks");
          taskStorage.text = textNode.innerHTML;
          changeStorage(taskStorage, "tasks");

          closeWindow(event);
        });

      //клик по кнопке Delete task
      document
        .querySelector("#app-task-delete")
        .addEventListener("click", function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();

          deleteItemFromStorage(taskStorage, "tasks");
          tasksSum(); //пересчет активных тасков
          closeWindow(event);
        });

      //клик по кнопке "закрыть"
      document
        .querySelector("#app-close-btn")
        .addEventListener("click", function (event) {
          closeWindow(event);
        });
    });
  });  
};  

// Drag and Drop
function dragstart_handler(ev) {
  ev.dataTransfer.setData("text", ev.target.id); // id выбранной таски вида id-19886118-c348-48ea-9276-ac11d9009040
  ev.effectAllowed = "move";

  let step = currentStep(ev.target.id);
  ev.dataTransfer.setData("step", step);
}

function dragover_handler(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  document.querySelector("#app-ready-items").classList.remove("highlight");
  document.querySelector("#app-inprogress-items").classList.remove("highlight");
  document.querySelector("#app-finished-items").classList.remove("highlight");

  if (ev.target.id == "app-ready-col") {document.querySelector("#app-ready-items").classList.add("highlight");}
  if (ev.target.id == "app-inprogress-col") {document.querySelector("#app-inprogress-items").classList.add("highlight");}
  if (ev.target.id == "app-finished-col") {document.querySelector("#app-finished-items").classList.add("highlight");}

  //хак для дочерних элементов app-...-col, в которые не надо проваливаться во время event (pointer-events: none)
  let allReadyTasks = document.querySelector('#app-ready-col').querySelectorAll('*');
  let allInProgressTasks = document.querySelector('#app-inprogress-col').querySelectorAll('*'); 
  let allFinishedTasks = document.querySelector('#app-finished-col').querySelectorAll('*'); 
  let allTasks = [...allReadyTasks, ...allInProgressTasks, ...allFinishedTasks];
  
  for (let i = 0; i < allTasks.length; i++) {
    allTasks[i].classList.add('event');
  }
}

function drop_handler(ev) {
  ev.preventDefault();

  let id = ev.dataTransfer.getData("text");
  let header = currentHeader(id);
  let step = currentStep(id);

  if (step == "backlog") {
    if (ev.target.id == "app-ready-col") {
      changeStep (header, "ready");
      document.querySelector("#app-ready-items").insertAdjacentElement("beforeend", document.getElementById(id));
    } else {      
      document.querySelector("#content").innerHTML += alertTemplate; //шаблон алерта
      showAlert(`Task mudt be dropped into "Ready" list!`);
    }
  }
  if (step == "ready") {
    if (ev.target.id == "app-inprogress-col") {
      changeStep (header, "inprogress");
      document.querySelector("#app-inprogress-items").insertAdjacentElement("beforeend", document.getElementById(id));
    } else {      
      document.querySelector("#content").innerHTML += alertTemplate; //шаблон алерта
      showAlert(`Task mudt be dropped into "In progress" list!`);
    }
  }
  if (step == "inprogress") {
    if (ev.target.id == "app-finished-col") {
      changeStep (header, "finished");
      document.querySelector("#app-finished-items").insertAdjacentElement("beforeend", document.getElementById(id));
    } else {      
      document.querySelector("#content").innerHTML += alertTemplate; //шаблон алерта
      showAlert(`Task mudt be dropped into "Finished" list!`);
    }
  }
  showUserTasks(); //перезагружаем функции: без этого почему-то все ломается
}

function dragend_handler(ev) {
  // все "вертаем взад"
  document.querySelector("#app-ready-items").classList.remove("highlight");
  document.querySelector("#app-inprogress-items").classList.remove("highlight");
  document.querySelector("#app-finished-items").classList.remove("highlight");

  let allReadyTasks = document.querySelector('#app-ready-col').querySelectorAll('*');
  let allInProgressTasks = document.querySelector('#app-inprogress-col').querySelectorAll('*'); 
  let allFinishedTasks = document.querySelector('#app-finished-col').querySelectorAll('*'); 
  let allTasks = [...allReadyTasks, ...allInProgressTasks, ...allFinishedTasks];
  
  for (let i = 0; i < allTasks.length; i++) {
    allTasks[i].classList.remove('event');
  }
}

//вспомогательные функции
function currentStep(id) {
  let cleanId =  id.substring(3) // id вида вида 19886118-c348-48ea-9276-ac11d9009040
  storageData = getFromStorage("tasks");
  let step = storageData.filter((e) => e.id == cleanId)[0].step;
  return step;
}

function currentHeader(id) {
  let cleanId =  id.substring(3) // id вида вида 19886118-c348-48ea-9276-ac11d9009040
  storageData = getFromStorage("tasks");
  let header = storageData.filter((e) => e.id == cleanId)[0].header;
  return header;
}
// END Drag and Drop