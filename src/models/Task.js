import { BaseModel } from "./BaseModel"
import { addToStorage } from "../utils";

export class Task extends BaseModel {
    constructor(login,step,header,text) {
        super();
        this.login = login;
        this.step = step;
        this.header = header;
        this.text = text;
        this.storageKey = 'tasks';
    }
    static save(task) {
        try {
          addToStorage(task, task.storageKey);
          return true;
        } catch (e) {
          throw new Error(e);
        }
      }
}