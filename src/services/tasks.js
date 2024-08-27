import { getFromStorage } from "../utils";

//рендер тасков юзера (4 колонки)
export const showUserTasks = function (user) {
    let storageData = getFromStorage(user);
  
    const renderTasks = (currentStep) => {
      for (let i = 0; i < storageData.length; i++) {
        if (storageData[i].step == currentStep) {
          let a = document.createElement('a');
          a.className = "tasks-col__item bg-white";
          a.textContent = storageData[i].header;
          let node = document.querySelector('#app-' + `${currentStep}`);
          node.after(a);
        }
      };
    }
    renderTasks('backlog');
    renderTasks('ready');
    renderTasks('inprogress');
    renderTasks('finished');
  }

