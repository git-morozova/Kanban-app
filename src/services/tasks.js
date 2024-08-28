import { getFromStorage } from "../utils";
import { Task } from "../models/Task";
import { disabledActivator } from "../services/render";

//вспомогательная функция - рендер одного таска
const renderTask = function (i, currentStep, user, login, header) {
  let a = document.createElement('a');
    a.className = "tasks-col__item-task bg-white";
    a.textContent = header;

    let div = document.createElement('div');
    div.className = "tasks-col__item";
    div.setAttribute("id", "task_" + `${i}`);

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

//рендер всех тасков (4 колонки)
//заполняем колонки снизу вверх, чтобы сохранить порядок: сверху старые таски
export const showUserTasks = function (user) {
  let storageData = getFromStorage("tasks");

  const renderTasks = (currentStep) => {
    document.querySelector('#app-' + `${currentStep}` + '-items').innerHTML = ''; //очистка доски

    for (let i = 0; i < storageData.length; i++) {
      if (storageData[i].step == currentStep) {
        renderTask(i, currentStep, user, storageData[i].login, storageData[i].header);
      }
    };
  }
  renderTasks('backlog');
  renderTasks('ready');
  renderTasks('inprogress');
  renderTasks('finished');

  //производить манипуляции с addCard и Submit только после того, как они появятся в DOM
  addCardActivator(user);
  disabledActivator();
}

//добавляем функции кнопок
const addCardActivator = function (user) {
  let addBacklogBtn = document.querySelector('#app-backlog');

  //клик по кнопке addCard
  addBacklogBtn.addEventListener('click', function (event) {
    event.preventDefault();
    let submitNode = document.querySelector('#app-backlog-submit');
    let input = document.querySelector('#app-backlog-input');

    addBacklogBtn.classList.toggle('hidden');
    submitNode.classList.toggle('hidden');
    input.classList.toggle('hidden');
    input.value = "";
    input.focus();

    //клик по кнопке Submit или в любом месте кроме поля инпута
    input.onblur = function (event) {
      event.preventDefault();

      let newTask = new Task(user,'backlog', input.value, '');
      if (input.value) {
        addBacklogBtn.classList.toggle('hidden');
        submitNode.classList.toggle('hidden');
        input.classList.toggle('hidden');

        Task.save(newTask);

        let storageData = getFromStorage("tasks");
        let i = storageData.length-1;

        renderTask(i, 'backlog', user, "", storageData[i].header);
      }
      disabledActivator();
    }
  })
}
