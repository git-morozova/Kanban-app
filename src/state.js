export class State {
  constructor() {
    this.currentUser = null;
  }
  set currentUser(user) {
    this._currentUser = user;
  }
  get currentUser() {
    return this._currentUser;
  }
}
