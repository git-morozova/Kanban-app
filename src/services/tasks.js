import { getFromStorage, changeStorage } from "../utils";
import { Task } from "../models/Task";
import { disabledActivator, tasksSum, showAlert, elementToggle } from "../services/render";
import alertTemplate from "../templates/alert.html";
//обращение к local storage - отдельно для каждой функции, иначе все ломается

//вспомогательная функция - рендер одного таска
const renderTask = function (currentStep, user, login, header) {
  let a = document.createElement('a');
  let storageData = getFromStorage("tasks");
  let id = storageData.filter(e => e.header === header)[0].id;

    a.className = "tasks-col__item-task bg-white";
    a.textContent = header;

    let div = document.createElement('div');
    div.className = "tasks-col__item";
    div.id = 'id-' + `${id}`;

    let node = document.querySelector('#app-' + `${currentStep}` + '-items');
    node.insertAdjacentElement('beforeend', div); 
    div.insertAdjacentElement('afterbegin', a);

    //обычный пользователь видит только заголовки тасков
    //админу также показываем, какой пользователь прикреплен к каждому таску 
    if (user == "admin"){
      let userBadge = document.createElement('a');

      userBadge.className = "tasks-col__item-badge shape";
      userBadge.textContent = login;
      div.insertAdjacentElement('afterbegin', userBadge);
    }
}

//вспомогательная функция - меняет step для таски
const changeStep = function (header, step) {
  let storageData = getFromStorage("tasks");
  let tempTask = storageData.filter(e => e.header === header)[0];
  tempTask.step = step;

  changeStorage (tempTask,"tasks");
  deleteTask(tempTask.id);

  renderTask(step, tempTask.user, tempTask.login, header);
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
  let storageData = getFromStorage("tasks");

  const renderTasks = (currentStep) => {
    document.querySelector('#app-' + `${currentStep}` + '-items').innerHTML = ''; //очистка доски

    for (let i = 0; i < storageData.length; i++) {
      if (storageData[i].step == currentStep) {
        renderTask(currentStep, user, storageData[i].login, storageData[i].header);
      }
    };
  }
  renderTasks('backlog');
  renderTasks('ready');
  renderTasks('inprogress');
  renderTasks('finished');

  addCardActivator(user);
  disabledActivator();
}

//добавляем функции кнопок только после того, как они появятся в DOM
const addCardActivator = function (user) {
  let addBacklogBtn = document.querySelector('#app-backlog');
  let addReadyBtn = document.querySelector('#app-ready');

  //клик по кнопке addCard в колонке backlog
  addBacklogBtn.addEventListener('click', function (event) {
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
        let storageData = getFromStorage("tasks");
        
        if (storageData.some(e => e.header === input.value)) { //задача с таким заголовком уже существует
          document.querySelector("#content").innerHTML += alertTemplate; //шаблон алерта
          showAlert("Task with this header already exists");
          addCardActivator(user); //перезагружаем функцию: без этого почему-то перестает работать кнопка add
        } else {
          Task.save(newTask);

          storageData = getFromStorage("tasks"); //надо переписать с новой таской
          let i = storageData.length - 1;

          renderTask('backlog', user, "", storageData[i].header);
          disabledActivator();
          tasksSum(); //пересчет активных тасков
        }
      }
    }
  })

  //клик по кнопке addCard в колонке ready
  addReadyBtn.addEventListener('click', function (event) {
    event.stopImmediatePropagation(); //исправляем баг с двойным кликом из-за вложенности элементов (StackOverflow)
    event.preventDefault();
    let submitNode = document.querySelector('#app-ready-submit');

    elementToggle("#app-ready");
    elementToggle("#app-ready-submit");
    elementToggle("#app-select-box");

    //заполним выпадающий список тасками из колонки backlog
    let storageData = getFromStorage("tasks");
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
      let header = "";

      //определяем, какая опция выбрана, т.е. где display присвоен block      
      for (let i = 0; i < storageData.length; i++) {
        console.log(i);
        if (document.querySelector('#p' + `${i+1}`) === null) return; //убираем баг "parameter is not of type 'Element'""
        var option = document.querySelector('#p' + `${i+1}`);
        var pseudo = window.getComputedStyle(option, 'select-box__input-text');
        pseudo.getPropertyValue("display") == "block" ? header = option.innerHTML : false;
      };
      if(header == "") return;
      
      changeStep(header, 'ready'); //перекидываем таску в колонку ready

      //скрываем кнопку и инпут
      elementToggle("#app-ready");
      elementToggle("#app-ready-submit");
      elementToggle("#app-select-box");  
      
      //очищаем выпадающий список
      listLabels.innerHTML = "";
      document.querySelector('#app-list-inputs').innerHTML = `
      <div class="select-box__value">
        <input class="select-box__input" type="radio" id="0" name="ready" checked="checked">
        <p class="select-box__input-text">&nbsp;</p>
      </div>`;     
    })
  })
}