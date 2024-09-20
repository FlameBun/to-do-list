// localStorage.clear();

let taskListHead = JSON.parse(localStorage.getItem("taskListHead")); // Task list head node
const taskListMap = {}; // Object map of dates to task lists
let theme = localStorage.getItem("theme"); // Color theme of web page
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", 
  "Friday", "Saturday"];

// Rebuild task lists if there are any  
if (taskListHead !== null)
  rebuildTaskLists();

// Set color theme of web page
const themeIcon = document.getElementById("theme-icon");
if (
  theme === null &&
  window.matchMedia && 
  window.matchMedia("(prefers-color-scheme: dark)").matches
) { // If user opens page for the first time and prefers dark mode
  switchToDarkMode();
} else if (theme !== null) { // If user has previously used web app  
  if (theme === "Light-Mode")
    switchToLightMode();
  else
    switchToDarkMode();
} else {
  switchToLightMode();
}

// Add event handler to "plus" button
document.querySelector("#plus-button").addEventListener("click", addTaskList);

// Add event handler to light/dark mode button
themeIcon.addEventListener("click", changeTheme);

// Reallow background color transitions
setTimeout(() => {document.body.removeAttribute("class")}, 1);


function switchToDarkMode() {
  const themeIcon = document.getElementById("theme-icon");

  // Switch to dark mode
  document.body.id = "dark-mode";

  // Swap theme icon
  themeIcon.setAttribute("src", "img/Dark-Mode-Icon.svg");
  themeIcon.setAttribute("alt", "Moon");

  // Swap edit icon
  editIcons = document.getElementsByClassName("edit-icon");
  for (let i = 0; i < editIcons.length; i++)
    editIcons[i].setAttribute("src", "img/Dark-Mode-Edit-Icon.svg");

  // Swap error icons
  errorIcons = document.getElementsByClassName("error-icon");
  for (let i = 0; i < errorIcons.length; i++)
    errorIcons[i].setAttribute("src", "img/Dark-Mode-Error-Icon.svg");
  
  // Save web page theme to localStorage
  theme = "Dark-Mode";
  localStorage.setItem("theme", theme);
}

function switchToLightMode() {
  theme = "Light-Mode";

  const themeIcon = document.getElementById("theme-icon");

  // Switch to light mode
  document.body.id = "light-mode";

  // Swap theme icon
  themeIcon.setAttribute("src", "img/Light-Mode-Icon.svg");
  themeIcon.setAttribute("alt", "Sun");

  // Swap edit icons
  editIcons = document.getElementsByClassName("edit-icon");
  for (let i = 0; i < editIcons.length; i++)
    editIcons[i].setAttribute("src", "img/Light-Mode-Edit-Icon.svg");

  // Swap error icons
  errorIcons = document.getElementsByClassName("error-icon");
  for (let i = 0; i < errorIcons.length; i++)
    errorIcons[i].setAttribute("src", "img/Light-Mode-Error-Icon.svg");

  // Save web page theme to localStorage
  theme = "Light-Mode"
  localStorage.setItem("theme", theme);
}

function changeTheme() {
  if (document.body.id === "light-mode")
    switchToDarkMode();
  else
    switchToLightMode();
}


function addTaskList(event) {
  // Retrieve date input
  const inputDate = document.querySelector(`#date-input input[type="date"]`);
  let dateStr = inputDate.value; // Date string as YYYY-MM-DD

  // Error message if date is not provided
  if (dateStr === "") {
    noDateError();
    return;
  }

  if (taskListMap[dateStr] === undefined) { // If dated task list does not exist
    // Create task list container with specified date
    const dateObj = new Date(`${dateStr}T00:00`); // Date wrapped in an object
    const taskListContainer = createTaskList(dateStr, dateObj, false);

    // Initialize task list object
    const taskList = {
      dateObj,
      taskHead: null,
      container: taskListContainer,
      next: null,
      prev: null
    };

    // Insert taskList into main linked list
    insertTaskList(taskList);

    // Log task list in taskListMap
    taskListMap[dateStr] = taskList;

    // Clear error message if there is any
    if (document.querySelector(`#heading .error`) !== null)
      document.querySelector(`#heading .error`).remove();

    // Display specified task list in document
    displayTaskList(taskList);

    // Save main linked list in local storage
    saveMainLinkedList();

    // Clear input
    inputDate.value = "";
  } else {
    commonDateError();
    return;
  }
}

function noDateError() {
  let error = document.querySelector(`#heading .error`);
  const themeLowerCase = theme.toLowerCase();

  if (error !== null) {
    error.innerHTML = `
      <span>
        <img src="img/${theme}-Error-Icon.svg" class="error-icon">Please provide a complete date.
      </span>
    `;
    error.children[0].classList.add(`${themeLowerCase}-highlight`);

    return;
  }

  error = document.createElement("div");
  error.setAttribute("class", "error");
  error.innerHTML = `
    <span class="${themeLowerCase}-highlight">
      <img src="img/${theme}-Error-Icon.svg" class="error-icon">Please provide a complete date.
    </span>
  `;
  document.getElementById("heading").appendChild(error);
}

function commonDateError() {
  let error = document.querySelector(`#heading .error`);
  const themeLowerCase = theme.toLowerCase();

  if (error !== null) {
    error.innerHTML = `
      <span>
        <img src="img/${theme}-Error-Icon.svg" class="error-icon">Please provide a unique date.
      </span>
    `;
    error.children[0].classList.add(`${themeLowerCase}-highlight`);

    return;
  }

  error = document.createElement("div");
  error.setAttribute("class", "error");
  error.innerHTML = `
    <span class="${themeLowerCase}-highlight">
      <img src="img/${theme}-Error-Icon.svg" class="error-icon">Please provide a unique date.
    </span>
  `;
  document.getElementById("heading").appendChild(error);
}

function addTask(event) {
  const addButton = event.currentTarget;

  // Retrieve input elements
  const inputTask = addButton.previousElementSibling.previousElementSibling;
  const inputTime = addButton.previousElementSibling;

  // Retrieve name and time of task
  const name = inputTask.value;
  const time = inputTime.value; // Time string in military time

  // Error message if name of task or time is not provided
  const taskListId = addButton.parentElement.parentElement.id;
  if (name === "" || time === "") {
    taskError(taskListId);
    return;
  }

  // Create task container with name and date info
  const taskContainer = createTask(name, time, false);
  const task = {
    name,
    time,
    checked: false,
    container: taskContainer,
    next: null,
    prev: null
  };

  // Retrieve task list corresponding to date
  const taskList = taskListMap[addButton.parentElement.parentElement.id];
  
  // Insert task into specified task list
  insertTask(taskList, task);

  // Display specified task in document
  displayTask(taskList, task);
  
  // Clear input
  inputTask.value = "";
  inputTime.value = "";

  if (document.querySelector(`div[id="${taskListId}"] .error`) !== null)
    document.querySelector(`div[id="${taskListId}"] .error`).remove();

  // Save main linked list in local storage
  saveMainLinkedList();

  //debugMainLinkedList(); /* Debug */
}

function taskError(taskListId) {
  let error = document.querySelector(`div[id="${taskListId}"] .error`);
  const themeLowerCase = theme.toLowerCase();

  if (error !== null) {
    error.children[0].removeAttribute("class");
    error.children[0].offsetHeight;
    error.children[0].classList.add(`${themeLowerCase}-highlight`);
    
    return;
  }

  error = document.createElement("div");
  error.setAttribute("class", "error");
  error.innerHTML = `
    <span class="${themeLowerCase}-highlight">
      <img src="img/${theme}-Error-Icon.svg" class="error-icon">Please provide a task and a complete time.
    </span>
  `;

  const inputBar = document.querySelector(`div[id="${taskListId}"] .input-bar`);
  inputBar.appendChild(error);
}

function createTask(name, time, checked) {
  // Create task container (grid container)
  const taskContainer = document.createElement("div");
  taskContainer.setAttribute("class", "task-container")

  // Set task info
  const divTask = document.createElement("div");
  divTask.innerHTML += `
    <div class="time">${formatTime(time)}</div>
    <span class="task">
      <span class="checkmark"></span>
      <input type="checkbox">${name}
    </span>
  `;

  // Install event listener on checkbox
  const checkbox = divTask.children[1].children[1];
  checkbox.addEventListener("click", toggleCheck);
  checkbox.checked = checked;

  // Create remove button and install event listener
  const removeButton = document.createElement("div");
  removeButton.setAttribute("class", "remove-button");
  removeButton.addEventListener("click", remove);
  const removeButtonContainer = document.createElement("div");
  removeButtonContainer.appendChild(removeButton);

  // Add task info and features in task container
  taskContainer.appendChild(divTask);
  taskContainer.appendChild(removeButtonContainer);

  return taskContainer;
}

function createTaskList(dateStr, dateObj, rebuildBool) {
  // Create task list container
  const taskListContainer = document.createElement("div");
  taskListContainer.setAttribute("class", "task-list-container");
  taskListContainer.id = dateStr;

  // Create heading (grid) with date and remove button for task list
  const heading = document.createElement("div");
  heading.setAttribute("class", "task-list-heading");

  const dayName = dayNames[dateObj.getDay()];
  const date = document.createElement("h2");  // 1st grid item
  dateStr = dateStr.split("-");
  dateStr = `${dateStr[1]}/${dateStr[2]}/${dateStr[0]}`; // MM/DD/YYYY
  date.innerText = `${dateStr} - ${dayName}`;

  const editButton = document.createElement("img"); // 2nd grid item
  editButton.setAttribute("src", `img/${theme}-Edit-Icon.svg`);
  editButton.setAttribute("alt", "Edit Icon");
  editButton.setAttribute("class", "edit-icon");
  editButton.addEventListener("click", toggleInputBar);

  const removeButton = document.createElement("div");
  removeButton.setAttribute("class", "remove-button");
  removeButton.addEventListener("click", remove);
  const removeButtonContainer = document.createElement("div"); // 3rd grid item
  removeButtonContainer.appendChild(removeButton);

  heading.appendChild(date);
  heading.appendChild(editButton);
  heading.appendChild(removeButtonContainer);

  // Append heading to task list container
  taskListContainer.appendChild(heading);

  // Append input bar to task list container
  const inputBar = document.createElement("div");
  inputBar.classList.add("input-bar");
  inputBar.innerHTML = `
    <input placeholder="Task">
    <input type="time">
  `;
  const addButton = document.createElement("button");
  addButton.setAttribute("class", "add-button");
  addButton.addEventListener("click", addTask);
  addButton.innerText = "Add";
  inputBar.appendChild(addButton);
  taskListContainer.appendChild(inputBar);

  // Build input bar if web elements are not in process of being rebuilt
  if (rebuildBool === true)
    inputBar.classList.add("hidden");

  return taskListContainer;
}

// Display task in specified taskList in document
function displayTask(taskList, task) {
  const element = (task.next !== null) ? task.next.container : null;

  taskList.container.classList.add("bg-transition-none");
  taskList.container.insertBefore(task.container, element);
  task.container.animate([
    {transform: "scale(0)", easing: "ease"},
    {transform: "scale(1)"}
  ], 500);
  
  setTimeout(() => {
    taskList.container.classList.remove("bg-transition-none");
  }, 1);
  
}

// Display taskList in document
function displayTaskList(taskList) {
  const mainContent = document.getElementById("main-content");
  const element = (taskList.next !== null) ? taskList.next.container : null;

  mainContent.insertBefore(taskList.container, element);
  taskList.container.animate([
    {transform: "scale(0)", easing: "ease"},
    {transform: "scale(1)"}
  ], 500);
  
  if (taskList.container.getBoundingClientRect().bottom + 48 > window.innerHeight)
    taskList.container.scrollIntoView({block: "end", behavior: "smooth"});
}

/**
 * Insert task into a secondary linked list such that the tasks are organized
 * in ascending order by time.
 */
function insertTask(taskList, task) {
  let ptr = taskList.taskHead;
  if (ptr === null) { // If there are no tasks in task list
    taskList.taskHead = task;
    return;
  }

  // Insert task in appropriate position of linked list
  while (ptr !== null) {
    if (task.time < ptr.time) { // If time of task is earlier
      task.prev = ptr.prev;
      task.next = ptr;
      ptr.prev = task;

      if (task.prev !== null) // If task is not head
        task.prev.next = task;
      else // If task is head
        taskList.taskHead = task;

      return;
    }

    if (ptr.next === null) { // If ptr is at last node
      ptr.next = task;
      task.prev = ptr;
      return;
    }

    ptr = ptr.next;
  }
}

/**
 * Insert taskList into the main linked list such that the task lists are
 * organized in ascending order by date.
 */
function insertTaskList(taskList) {
  let ptr = taskListHead;
  
  if (ptr === null) { // If there are no task lists
    taskListHead = taskList;
    return;
  }

  // Insert taskList in appropriate position of main linked list
  while (ptr !== null) {
    if (taskList.dateObj < ptr.dateObj) { // If date of taskList is earlier
      taskList.prev = ptr.prev;
      taskList.next = ptr;
      ptr.prev = taskList;

      if (taskList.prev !== null) // If taskList is not head
        taskList.prev.next = taskList;
      else // If taskList is new head
        taskListHead = taskList;

      return;
    }

    if (ptr.next === null) { // If ptr is at last node
      ptr.next = taskList;
      taskList.prev = ptr;
      return;
    }

    ptr = ptr.next;
  }
}

function toggleInputBar(event) {
  const taskListContainer = event.currentTarget.parentElement.parentElement;
  const element = taskListContainer.children[1];

  // Toggle input bar
  if (element.classList.contains("hidden")) {
    element.classList.remove("hidden");
  } else {
    element.classList.add("hidden");
    if (element.children[3] !== undefined)
      element.children[3].remove();
  }
}

/**
 * Create an input bar for the heading of a task list.
 */
function buildInputBar(inputBar) {
  inputBar.innerHTML = `
    <input placeholder="Task">
    <input type="time">
  `;
  const addButton = document.createElement("button");
  addButton.setAttribute("class", "add-button");
  addButton.addEventListener("click", addTask);
  addButton.innerText = "Add";
  inputBar.appendChild(addButton);
}

function remove(event) {
  // Retrieve corresponding taskList associated with remove button
  const container = event.currentTarget.parentElement.parentElement;
  taskList = taskListMap[container.parentElement.id];

  // Return if task attempts to be removed after task list is removed
  if (taskList === undefined)
    return;

  // Remove task list or task
  if (container.classList.contains("task-list-heading"))
    removeTaskList(taskList);
  else
    removeTask(taskList, container);

  // Save main linked list in local storage
  saveMainLinkedList();

  //debugMainLinkedList(); /* Debug */
}

function removeTaskList(taskList) {
  // Remove taskList from main linked list
  if (taskList.prev === null) // If taskList is first in main linked list
    taskListHead = taskList.next;
  else
    taskList.prev.next = taskList.next;

  if (taskList.next !== null) // If taskList is NOT last in main linked list
    taskList.next.prev = taskList.prev;

  // Remove taskList from taskListMap
  delete taskListMap[taskList.container.id]; 

  taskList.container.addEventListener("animationend", function(event) {
    if (event.animationName === "shrink-task-list")
      taskList.container.remove();
  });

  // Shrink task list container
  taskList.container.classList.add("shrink-task-list");

  // Remove taskList container from document
  // taskList.container.remove();
}

function removeTask(taskList, taskContainer) {
  // Remove corresponding task from task list
  let ptr = taskList.taskHead;
  while (true) {
    if (taskContainer === ptr.container) { // If task container matches
      if (ptr.prev === null) // If ptr is at beginning of task list
        taskList.taskHead = ptr.next;
      else
        ptr.prev.next = ptr.next;

      if (ptr.next !== null) // If there ptr is NOT at end of task list
        ptr.next.prev = ptr.prev;
      
      break;
    }

    ptr = ptr.next;
  }

  taskContainer.addEventListener("animationend", function(event) {
    if (event.animationName === "shrink-task") {
      taskList.container.classList.add("bg-transition-none");
      taskContainer.remove();
      setTimeout(() => {
        taskList.container.classList.remove("bg-transition-none");
      }, 1);
    }
  });
  
  // Shrink task container
  taskContainer.classList.add("shrink-task");

  // Remove task from document
  // taskContainer.remove();
}



// Assume time is a string formatted in military time HH:MM
function formatTime(time) {
  time = time.split(":");
  time[0] = Number(time[0]);

  if (time[0] >= 12) { // If hour is at least 12
    time[0] = (time[0] === 12) ? 12 : (time[0] - 12);
    time = `${time[0]}:${time[1]} PM`;
  } else {
    time[0] = (time[0] === 0) ? 12 : time[0];
    time = `${time[0]}:${time[1]} AM`;
  }

  return time;
}

/**
 * Toggle the check value of a task.
 */
function toggleCheck(event) {
  const taskContainer = event.currentTarget.parentElement.parentElement.parentElement;
  const taskList = taskListMap[taskContainer.parentElement.id];
  
  // Traverse through task list
  let ptr = taskList.taskHead;
  while (true) {
    if (ptr.container === taskContainer) {
      ptr.checked = !ptr.checked; // Toggle check value
      break;
    }

    ptr = ptr.next;
  }

  saveMainLinkedList();
}

/**
 * Rebuild task lists if there are any. dateObj is initially a string of a date.
 */
function rebuildTaskLists() {
  let prevPtr = null;
  let currPtr = taskListHead;
  while (currPtr !== null) {
    // Map date to this task list
    taskListMap[currPtr.dateObj] = currPtr;

    // Recreate task list container
    const dateStr = currPtr.dateObj;
    currPtr.dateObj = new Date(`${dateStr}T00:00`);
    currPtr.container = createTaskList(dateStr, currPtr.dateObj, true);

    // Rebuild tasks, if any, in task list
    rebuildTasks(currPtr.container, currPtr.taskHead);

    // Display task list in document
    document.getElementById("main-content").appendChild(currPtr.container);
    
    // Fix prev pointer for current task list node
    currPtr.prev = prevPtr;

    prevPtr = currPtr;
    currPtr = currPtr.next;
  }
}

/**
 * Rebuild tasks, if any, in a task list.
 */
function rebuildTasks(taskListContainer, taskHead) {
  let prevPtr = null;
  let currPtr = taskHead;
  while (currPtr !== null) {
    // Recreate task container
    currPtr.container = createTask(currPtr.name, currPtr.time, currPtr.checked);

    // Add task container to task list container
    taskListContainer.appendChild(currPtr.container);

    // Fix prev pointer for current task node
    currPtr.prev = prevPtr;

    prevPtr = currPtr;
    currPtr = currPtr.next;
  }
}

function saveMainLinkedList() {
  // Save main linked list in local storage
  jsonStr = JSON.stringify(taskListHead, function(key, value) {
    if (key === "container" || key === "prev")
      return null;

    if (key === "dateObj")
      return value.toString().substring(0, 10);

    return value;
  });

  localStorage.setItem("taskListHead", jsonStr);
}

function debugMainLinkedList() {
  console.log(JSON.stringify(taskListHead, function(key, value) {
    if (key === "container" || key === "prev")
      return null;

    if (key === "dateObj")
      return value.toString().substring(0, 10);

    return value;
  }, 2));
}
