import { getFromStorage, changeStorage } from "../utils";
import { Task } from "../models/Task";
import { disabledActivator, tasksSum, showAlert, elementToggle } from "../services/render";
import alertTemplate from "../templates/alert.html";

let storageData = getFromStorage("tasks");

//вспомогательная функция - рендер одного таска
const renderTask = function (id) {
  let task = storageData.filter(e => e.id === id)[0];

  let a = document.createElement('a');
  a.className = "tasks-col__item-task bg-white";
  a.textContent = task.header;

  let div = document.createElement('div');
  div.className = "tasks-col__item";
  div.id = 'id-' + `${id}`;

  let node = document.querySelector('#app-' + `${task.step}` + '-items');
  node.insertAdjacentElement('beforeend', div); 
  div.insertAdjacentElement('afterbegin', a);

  //обычный пользователь видит только заголовки тасков
  //админу также показываем, какой пользователь прикреплен к каждому таску 
  if (getFromStorage("currentUser") == "admin"){
    let userBadge = document.createElement('a');

    userBadge.className = "tasks-col__item-badge shape";
    userBadge.textContent = task.login;
    div.insertAdjacentElement('afterbegin', userBadge);
  }
}

//вспомогательная функция - меняет step для таски
const changeStep = function (header, step) {
  let tempTask = storageData.filter(e => e.header === header)[0];
  tempTask.step = step;

  changeStorage (tempTask, "tasks");
  deleteTask(tempTask.id);

  renderTask(tempTask.id);
  disabledActivator();
  tasksSum();
}

//вспомогательная функция - убрать из DOM один таск
const deleteTask = function (id) {
  let taskNode = document.querySelector('#id-' + `${id}`);
  taskNode.remove();
}

//рендер всех тасков (4 колонки)
//заполняем колонки снизу вверх, чтобы сохранить порядок: сверху старые таски
export const showUserTasks = function (user) {
  storageData = getFromStorage("tasks"); //обновим, иначе вывалится storage предыдущей сессии

  const renderTasks = (currentStep) => {
    document.querySelector('#app-' + `${currentStep}` + '-items').innerHTML = ''; //очистка доски

    for (let i = 0; i < storageData.length; i++) {
      if (storageData[i].step == currentStep) {
        renderTask(storageData[i].id);
      }
    };
  }
  renderTasks('backlog');
  renderTasks('ready');
  renderTasks('inprogress');
  renderTasks('finished');

  //добавляем функции кнопок только после того, как они появятся в DOM
  backlogActivator(user);
  readyActivator();
  disabledActivator();
}

//клик по кнопке addCard в колонке backlog
const backlogActivator = function (user) {
  let addBtn = document.querySelector('#app-backlog');

  addBtn.addEventListener('click', function (event) {
    event.preventDefault();
    elementToggle("#app-backlog");
    elementToggle("#app-backlog-submit");

    let input = document.querySelector('#app-backlog-input');
    elementToggle("#app-backlog-input");
    input.value = "";
    input.focus();

    //клик по кнопке Submit или в любом месте кроме поля инпута
    input.onblur = function (event) {
      event.preventDefault();

      let newTask = new Task(user,'backlog', input.value, '');

      elementToggle("#app-backlog");
      elementToggle("#app-backlog-submit");      
      elementToggle("#app-backlog-input");

      if (input.value) {        
        if (storageData.some(e => e.header === input.value)) { //задача с таким заголовком уже существует
          document.querySelector("#content").innerHTML += alertTemplate; //шаблон алерта
          showAlert("Task with this header already exists");
          backlogActivator(user); //перезагружаем функцию: без этого почему-то перестает работать кнопка add
          readyActivator();
        } else {
          Task.save(newTask);

          storageData = getFromStorage("tasks"); //надо переписать с новой таской
          let i = storageData.length - 1;

          renderTask(storageData[i].id);
          disabledActivator();
          tasksSum(); //пересчет активных тасков
        }
      }
    }
  })
}

//клик по кнопке addCard в колонке ready
const readyActivator = function () {
  let addBtn = document.querySelector('#app-ready');
  let submitNode = document.querySelector('#app-ready-submit');

  addBtn.addEventListener('click', function (event) {
    event.stopImmediatePropagation(); //исправляем баг с двойным кликом из-за вложенности элементов (StackOverflow)
    event.preventDefault();

    elementToggle("#app-ready");
    elementToggle("#app-ready-submit");
    elementToggle("#app-select-box");

    //заполним выпадающий список тасками из колонки backlog
    storageData = storageData.filter(e => e.step === 'backlog');
    let listInputs = document.querySelector('#app-list-inputs');
    let listLabels = document.querySelector('#app-list-labels');

    for (let i = 0; i < storageData.length; i++) {
      let listInput = `
      <div class="select-box__value">
        <input class="select-box__input" type="radio" id="${i+1}" name="ready">
        <p class="select-box__input-text" id="p${i+1}">${storageData[i].header}</p>
      </div>`;
      listInputs.insertAdjacentHTML('beforeend', listInput);

      let listLabel = `
      <li>
        <label class="select-box__option" for="${i+1}" aria-hidden="aria-hidden">${storageData[i].header}</label>
      </li>`;
      listLabels.insertAdjacentHTML('beforeend', listLabel);
    };

    //клик по кнопке Submit
    submitNode.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      let header = "";

      //определяем, какая опция выбрана, т.е. где display присвоен block      
      for (let i = 0; i < storageData.length; i++) {
        if (document.querySelector('#p' + `${i+1}`) === null) return; //убираем баг "parameter is not of type 'Element'""
        var option = document.querySelector('#p' + `${i+1}`);
        var pseudo = window.getComputedStyle(option, 'select-box__input-text');
        pseudo.getPropertyValue("display") == "block" ? header = option.innerHTML : false;
      };
      if(header == "") return;

      changeStep(header, 'ready'); //перекидываем таску в колонку ready
      clearSelectNodes();
    })
  })

  //подфункция очистки выпадающего списка и тоггл
  const clearSelectNodes = function () {
    let listLabels = document.querySelector('#app-list-labels');
    elementToggle("#app-ready");
    elementToggle("#app-ready-submit");
    elementToggle("#app-select-box");

    listLabels.innerHTML = "";
    document.querySelector('#app-list-inputs').innerHTML = `
    <div class="select-box__value">
      <input class="select-box__input" type="radio" id="0" name="ready" checked="checked">
      <p class="select-box__input-text">&nbsp;</p>
    </div>`;
  }

  //возвращаем кнопку add card при клике вне колонки
  window.addEventListener('click', function(e) {
    if(document.querySelector('.tasks')) {
      var boxNode = document.querySelector('.tasks').children
      if (!boxNode[1].contains(e.target) && !submitNode.classList.contains("hidden")) {
        clearSelectNodes();
      }
    }
  });
}