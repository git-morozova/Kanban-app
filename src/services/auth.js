import { appState } from "../app";
import { User } from "../models/User";
import { getFromStorage, filterStorageTasks } from "../utils";

// аутентификация
export const authUser = function (login, password) {
  const user = new User(login, password);
  if (!user.hasAccess) return false;
  appState.currentUser = user;
  filterStorageTasks(login);
  return true;
};

//Проверка аутентификации в local storage
export const checkStorageAuth = function () {
  let getStorageAuth = getFromStorage("currentUser");

  if (getStorageAuth.length !== 0) {
    console.log("Вход пользователя " + getStorageAuth[0] + " из local storage");
    appState.currentUser = getStorageAuth[0];
    filterStorageTasks(appState.currentUser);
    return true;
  } else {
    console.log("Нет входа");
    return false;
  }
}