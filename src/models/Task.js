import { BaseModel } from "./BaseModel"
import { addToStorage } from "../utils";

export class Task extends BaseModel {
    constructor(login,step,header,text) {
        super();
        this.step = step;
        this.header = header;
        this.text = text;
        this.storageKey = login;
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