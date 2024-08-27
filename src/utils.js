export const getFromStorage = function (key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const removeFromStorage = function (key) {
  localStorage.removeItem(key);
};

export const generateTestUser = function (User) {
  localStorage.clear();
  const testUser = new User("test", "123");
  const testUser2 = new User("test2", "123");
  const testAdmin = new User("admin", "qwerty123");
  User.save(testUser);
  User.save(testUser2);
  User.save(testAdmin);
};

export const generateTestTasks = function (Task) {
  const testTask1 = new Task('test','backlog', 'Login page – performance issues', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione voluptate sunt ut pariatur ex ab alias et facere repellat itaque unde atque, mollitia commodi labore? Perspiciatis iusto quis optio. Iusto!');
  const testTask2 = new Task('test','backlog', 'Sprint bugfix', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione voluptate sunt ut pariatur ex ab alias et facere repellat itaque unde atque, mollitia commodi labore? Perspiciatis iusto quis optio. Iusto!');
  const testTask3 = new Task('test','ready', 'Shop page – performance issues', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione voluptate sunt ut pariatur ex ab alias et facere repellat itaque unde atque, mollitia commodi labore? Perspiciatis iusto quis optio. Iusto!');
  Task.save(testTask1);
  Task.save(testTask2);
  Task.save(testTask3);
  const testTask4 = new Task('test2','backlog', 'Auth bugfix', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione voluptate sunt ut pariatur ex ab alias et facere repellat itaque unde atque, mollitia commodi labore? Perspiciatis iusto quis optio. Iusto!');
  const testTask5 = new Task('test2','ready', 'Checkout bugfix', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione voluptate sunt ut pariatur ex ab alias et facere repellat itaque unde atque, mollitia commodi labore? Perspiciatis iusto quis optio. Iusto!');
  const testTask6 = new Task('test2','ready', 'Shop bug5', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione voluptate sunt ut pariatur ex ab alias et facere repellat itaque unde atque, mollitia commodi labore? Perspiciatis iusto quis optio. Iusto!');
  Task.save(testTask4);
  Task.save(testTask5);
  Task.save(testTask6);
}; 