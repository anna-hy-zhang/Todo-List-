// JS variables
const LOCAL_STORAGE_LIST_KEY = 'todoList';
let todoListObj = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || {};
if (Object.keys(todoListObj).length === 0) {
  todoListObj.category = {};
  todoListObj.categoryId = 0;
  todoListObj.taskId = 0;
  todoListObj.selectedCategoryListId = null;
  todoListObj.categoryIdOrder = [];
  todoListObj.filter = 'all-tasks';
}


// selectors
const categoryList = document.querySelector('.category-list');
const categoryTypeBoxInput = document.querySelector('.category-list-input');
const taskList = document.querySelector('.task-list');
const taskTypeBoxInput = document.querySelector('.task-list-input');
const taskListContainer = document.querySelector('.task-list-container');
let taskListTitle = document.querySelector('.task-list-title');
const categoryTemplate = document.getElementById('category-template');
const taskTemplate = document.getElementById('task-template');

const bottomBar = document.querySelector('.bottomBar');
const bottomInforText = document.querySelector('.bottomInforSpan');
const filtersButton = document.querySelector('.filters-button');
const selectBox = document.querySelector('.select-box');
const optionsContainer = document.querySelector('.options-container');
const clearCompletedButton = document.querySelector('.clear-completed-button');



// functions
function addNewCategory(event) {
  // create new category list
  if (event.code === 'Enter') {
    event.preventDefault();
    // update js model
    if (categoryTypeBoxInput.value == "") {
      return;
    }
    todoListObj.category[todoListObj.categoryId] = {
      name: categoryTypeBoxInput.value,
      content: {},
      activeTaskCount: 0
    };
    todoListObj.selectedCategoryListId = todoListObj.categoryId;
    todoListObj.categoryIdOrder.push(todoListObj.categoryId);
    todoListObj.categoryId++;
    // console.log('todoListObj', todoListObj)
    // save and render interface
    save();
    renderCategoryList('scrollToBottom');
    renderSelectedTaskList('scrollToBottom');
  }
}


function addNewTask(event) {
  if (event.code === 'Enter') {
    event.preventDefault();
    // update js model
    if (taskTypeBoxInput.value == "") {
      return;
    }
    const taskId = todoListObj.taskId;
    const categoryId = todoListObj.selectedCategoryListId;
    todoListObj.category[categoryId].content[taskId] = {
      content: taskTypeBoxInput.value,
      complete: false
    }
    todoListObj.taskId++;
    todoListObj.category[categoryId].activeTaskCount++;
    // save & render
    save();
    renderSelectedTaskList('scrollToBottom');
  }
}

function deleteTask(event) {
  if (event.target.classList.contains('task-delete-button')) {
    // update js model
      const categoryId = todoListObj.selectedCategoryListId;
      const taskId = event.target.parentNode.getAttribute('data-task-id');
      const iscompleted = todoListObj.category[todoListObj.selectedCategoryListId].content[taskId].complete;
      if (!iscompleted) {
        todoListObj.category[categoryId].activeTaskCount--;
      }
      delete todoListObj.category[todoListObj.selectedCategoryListId].content[taskId];
    // save & render
    save();
    renderSelectedTaskList();
  }
}

function completeTask(event) {
  if (event.target.classList.contains('custom-checkbox')) {
    const categoryId = todoListObj.selectedCategoryListId;
    const taskId = event.target.parentNode.parentNode.getAttribute('data-task-id');
    if (todoListObj.category[categoryId].content[taskId].complete) {
      todoListObj.category[categoryId].content[taskId].complete = false;
      todoListObj.category[categoryId].activeTaskCount++;
    } else {
      todoListObj.category[categoryId].content[taskId].complete = true;
      todoListObj.category[categoryId].activeTaskCount--;
    }
  } 
    // save & render
    save();
    renderSelectedTaskList();
}


function save() {
  // save to local storage
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(todoListObj));
}


function clearList(list) {
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
}

function updateScrollHeight(list, type) {
  // scroll to the bottom 
  if (type === 'scrollToBottom') {
    list.scrollTop = list.scrollHeight;
    return;
  } 
  // maintain current scroll height
  if (window.location.href.indexOf('page_y') != -1 ) {
    var match = window.location.href.split('?')[1].split("&")[0].split("=");
    window.scrollTo(0, match[1]);
  }
}


function renderCategoryList(type) {
  // clear old list
  clearList(categoryList);
  categoryTypeBoxInput.value = "";
  // render new list
  const allKeys = Object.keys(todoListObj.category);
  allKeys.forEach((currKey) => {
    const categoryElement = document.importNode(categoryTemplate.content, true);
    const categoryContainer = categoryElement.querySelector('li');
    categoryContainer.setAttribute('data-category-id', currKey);
    categoryContainer.append(todoListObj.category[currKey].name);
    categoryList.appendChild(categoryElement);
    updateScrollHeight(categoryList, type);

    // mark selected list
    if (currKey == todoListObj.selectedCategoryListId) {
      categoryContainer.classList.add('selected');
    }
  })
}


function renderSelectedTaskList(type) {
  const categoryId = todoListObj.selectedCategoryListId;
  // show default list || clear previous list
  if (categoryId == null) {
    taskListContainer.classList.add('hidden');
    return;
  } else if (taskListContainer.classList.contains('hidden')) {
    taskListContainer.classList.remove('hidden');
  } 
    
  clearList(taskList);
 
  // render selected task list
  if (todoListObj.category[categoryId]) {
    const currCategoryListObj = todoListObj.category[categoryId].content;
    const allKeys = Object.keys(currCategoryListObj);
    allKeys.forEach((currKey) => {
      const taskElement = document.importNode(taskTemplate.content, true);
      const taskContainer = taskElement.querySelector('li');
      taskContainer.setAttribute('data-task-id', currKey);
      const checkbox = taskElement.querySelector('input');
      checkbox.id = currKey;
      checkbox.checked = currCategoryListObj[currKey].complete;
      const label = taskElement.querySelector('label');
      label.htmlFor = currKey;
      label.append(currCategoryListObj[currKey].content);
      if (checkbox.checked) {
        label.classList.add('.completed-task');
      }
      
      taskList.appendChild(taskElement);
    });

    // render related elements
    taskListTitle.innerHTML = todoListObj.category[categoryId].name;
    taskTypeBoxInput.value = "";
    bottomInforText.innerHTML = `You have ${todoListObj.category[categoryId].activeTaskCount} todo items.`
    updateScrollHeight(taskList, type);
  }
}

function renderListItem(key, obj) {
  const taskElement = document.importNode(taskTemplate.content, true);
  const taskContainer = taskElement.querySelector('li');
  taskContainer.setAttribute('data-task-id', key);
  const checkbox = taskElement.querySelector('input');
  checkbox.id = key;
  checkbox.checked = obj[key].complete;
  const label = taskElement.querySelector('label');
  label.htmlFor = key;
  label.append(obj[key].content);
  taskList.appendChild(taskElement);
}

function renderTaskListByFilter(filter) {
  clearList(taskList);

  // render selected task list
  const categoryId = todoListObj.selectedCategoryListId;
  if (todoListObj.category[categoryId]) {
    const currCategoryListObj = todoListObj.category[categoryId].content;
    const allKeys = Object.keys(currCategoryListObj);
    allKeys.forEach((currKey) => {
      if (filter === 'all-tasks') {
        renderListItem(currKey, currCategoryListObj);
      } else if (filter === 'active-tasks' && !currCategoryListObj[currKey].complete) {
        renderListItem(currKey, currCategoryListObj);
      } else if (filter === 'completed-tasks' && currCategoryListObj[currKey].complete) {
        renderListItem(currKey, currCategoryListObj);
      } 
    });
    // render related elements
    taskListTitle.innerHTML = todoListObj.category[categoryId].name;
    taskTypeBoxInput.value = "";
    bottomInforText.innerHTML = `You have ${todoListObj.category[categoryId].activeTaskCount} todo items.`
  }
}


function updateSelectedCategoryListId(event) {
  if (event.target.tagName === 'LI') {
    const selectedCategoryListId = event.target.getAttribute('data-category-id');
    todoListObj.selectedCategoryListId = selectedCategoryListId;
  }
  // save
  save();
}


function selectTaskListToRender() {
  // hide task list if there is no category list
  if (todoListObj.categoryIdOrder.length === 0 || todoListObj.selectedCategoryListId == null) {
    taskListContainer.classList.add('hidden');
    return;
  }
  renderSelectedTaskList();
}


function deleteCategoryList(event) {
  if (event.target.tagName === 'BUTTON') {
    // delete list from js model
    const listId = event.target.parentNode.getAttribute('data-category-id');
    const listIndex = todoListObj.categoryIdOrder.findIndex((el) => el === parseInt(listId));
    delete todoListObj.category[listId];
    todoListObj.categoryIdOrder.splice(listIndex, 1);
    if (todoListObj.selectedCategoryListId == listId) {
      todoListObj.selectedCategoryListId = null;
    }
    // save & render html
    save();
    renderCategoryList();
    selectTaskListToRender();
  }
}


function clearCompletedTasks() {
  const allTasks = todoListObj.category[todoListObj.selectedCategoryListId].content;
  for (const taskId in allTasks) {
    if (allTasks[taskId].complete) {
      delete todoListObj.category[todoListObj.selectedCategoryListId].content[taskId];
    }
  }

  // save & render html
  save();
  renderCategoryList();
  selectTaskListToRender();
}


function renderForReload() {
  renderCategoryList();
  selectTaskListToRender();
}


// event listeners
categoryTypeBoxInput.addEventListener('keydown', addNewCategory);
categoryList.addEventListener('click', (event) => {
  updateSelectedCategoryListId(event);
  renderCategoryList();
  renderSelectedTaskList(event);
  deleteCategoryList(event);
});

taskList.addEventListener('click', (event) => {
  completeTask(event);
  deleteTask(event);
})
taskTypeBoxInput.addEventListener('keydown', addNewTask);
filtersButton.addEventListener('click', renderSelectedTaskList);
clearCompletedButton.addEventListener('click', () => {
  clearCompletedTasks();
  renderSelectedTaskList();
});

filtersButton.addEventListener('click', () => {
  optionsContainer.classList.toggle('active');
})
selectBox.addEventListener('click', (event) => {
  // console.log('event.target', event.target)
  if (event.target.tagName === 'SPAN') {
    return;
  }
  const filter = event.target.id;
  renderTaskListByFilter(filter);
})
renderForReload(); 


