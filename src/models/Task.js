import { BaseModel } from "./BaseModel"

export class Task extends BaseModel {
    constructor(header,text) {
        super();
        this.header = header;
        this.text = text;
    }
}
