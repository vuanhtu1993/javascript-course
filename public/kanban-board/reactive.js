// Store
let store = {
  todo: [],
  inprogress: [],
  done: []
}

function saveStore() {
  localStorage.setItem('kanbanState', JSON.stringify(store));
}

function loadStore() {
  const savedStore = localStorage.getItem("kanbanState")
  if (savedStore) {
    store = JSON.parse(savedStore)
  }
}

// Rnder all tasks
function renderAllTasks() {
  for (const column in store) {
    console.log(`Rendering tasks for ${column}`);
    const columnEl = document.querySelector(`#${column}-tasks`);

    const text = store[column].map(task => {
      return `<div draggable="true" class="mt-2 border border-dashed rounded-lg p-2">${task}</div>`
    }).join("");

    columnEl.innerHTML = text;

    // Add dragstart event listeners to the newly created tasks
    const tasks = columnEl.querySelectorAll('div[draggable="true"]');
    tasks.forEach(task => {
      task.addEventListener('dragstart', (e) => {
        console.log('dragstart event', e);
        // Set the task's text as the drag data
        e.dataTransfer.setData('text/plain', task.innerText);
        // Store the source column for later use
        e.dataTransfer.setData('sourceColumn', column);
      });
    });
  }
}

// Drag and drop event
function initializeDragAndDrop() {
  const columns = document.querySelectorAll(".column");
  console.log("columns", columns);

  columns.forEach(column => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    column.addEventListener("drop", (e) => {
      e.preventDefault();
      console.log("drop event", e);

      const taskText = e.dataTransfer.getData("text/plain");
      const sourceColumn = e.dataTransfer.getData("sourceColumn");
      const targetColumn = column.id.replace("-tasks", "");

      console.log("Moving task:", taskText);
      console.log("From:", sourceColumn);
      console.log("To:", targetColumn);

      if (sourceColumn !== targetColumn) {
        // Remove from source column
        store[sourceColumn] = store[sourceColumn].filter(task => task !== taskText);
        // Add to target column
        store[targetColumn].push(taskText);
        // Save and render
        saveStore();
        renderAllTasks();
      }
    });
  });
}

// add event listeners to the task
const addBtns = document.querySelectorAll('.add-task');

addBtns.forEach(btn => {
  btn.onclick = () => {
    const column = btn.dataset.column;
    const taskText = prompt('Enter task text:');
    if (taskText && taskText.trim()) {
      store[column].push(taskText.trim());
      saveStore();
      renderAllTasks();
    }
  }
})

function main() {
  loadStore();
  renderAllTasks();
  initializeDragAndDrop()
}

main()
