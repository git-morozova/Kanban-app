import { getFromStorage } from "../utils";

//рендер тасков (4 колонки)
//заполняем колонки снизу вверх, чтобы сохранить порядок: сверху старые таски
export const showUserTasks = function (user) {
  let storageData = getFromStorage("tasks");

  const renderTasks = (currentStep) => {
    for (let i = 0; i < storageData.length; i++) {
      if (storageData[i].step == currentStep) {
        let a = document.createElement('a');
        a.className = "tasks-col__item-task bg-white";
        a.textContent = storageData[i].header;

        let div = document.createElement('div');
        div.className = "tasks-col__item";
        div.setAttribute("id", "task_" + `${i}`);

        let node = document.querySelector('#app-' + `${currentStep}`);
        node.before(div); div.insertAdjacentElement('afterbegin', a);

        //обычный пользователь видит только заголовки тасков
        //админу также показываем, какой пользователь прикреплен к каждому таску 
        if (user == "admin"){
          let userBadge = document.createElement('a');
          userBadge.className = "tasks-col__item-badge shape";
          userBadge.textContent = storageData[i].login;
          div.insertAdjacentElement('afterbegin', userBadge);
        }
      }
    };
  }
  renderTasks('backlog');
  renderTasks('ready');
  renderTasks('inprogress');
  renderTasks('finished');
}

