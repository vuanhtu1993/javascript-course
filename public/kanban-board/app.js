// State management
let state = {
  todo: [],
  inprogress: [],
  done: []
};

// Load state from localStorage
function loadState() {
  const savedState = localStorage.getItem('kanbanState');
  if (savedState) {
    state = JSON.parse(savedState);
    renderAllTasks();
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('kanbanState', JSON.stringify(state));
}

// Render all tasks
function renderAllTasks() {
  Object.keys(state).forEach(column => {
    const columnEl = document.querySelector(`[data-column="${column}"] .tasks`);
    columnEl.innerHTML = '';
    state[column].forEach(task => {
      const taskEl = createTaskElement(task);
      columnEl.appendChild(taskEl);
    });
  });
}

// Create task element
function createTaskElement(taskText) {
  const task = document.createElement('div');
  task.className = 'task';
  task.draggable = true;
  task.textContent = taskText;

  // Drag start event
  task.addEventListener('dragstart', (e) => {
    task.classList.add('dragging');
    e.dataTransfer.setData('text/plain', taskText);
    e.dataTransfer.effectAllowed = 'move';
  });

  // Drag end event
  task.addEventListener('dragend', () => {
    task.classList.remove('dragging');
  });

  return task;
}

// Initialize drag and drop
function initializeDragAndDrop() {
  const columns = document.querySelectorAll('.column');

  columns.forEach(column => {
    // Dragover event
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      column.classList.add('drag-over');
    });

    // Dragleave event
    column.addEventListener('dragleave', () => {
      column.classList.remove('drag-over');
    });

    // Drop event
    column.addEventListener('drop', (e) => {
      e.preventDefault();
      column.classList.remove('drag-over');

      const taskText = e.dataTransfer.getData('text/plain');
      const sourceColumn = findTaskColumn(taskText);
      const targetColumn = column.dataset.column;

      if (sourceColumn && sourceColumn !== targetColumn) {
        // Remove from source column
        state[sourceColumn] = state[sourceColumn].filter(t => t !== taskText);
        // Add to target column
        state[targetColumn].push(taskText);

        saveState();
        renderAllTasks();
      }
    });
  });
}

// Find which column contains a task
function findTaskColumn(taskText) {
  return Object.keys(state).find(column =>
    state[column].includes(taskText)
  );
}

// Add new task functionality
function initializeAddTask() {
  const addButtons = document.querySelectorAll('.add-task');

  addButtons.forEach(button => {
    button.addEventListener('click', () => {
      const column = button.closest('.column').dataset.column;
      const taskText = prompt('Enter task description:');

      if (taskText && taskText.trim()) {
        state[column].push(taskText.trim());
        saveState();
        renderAllTasks();
      }
    });
  });
}

// Initialize app
function init() {
  loadState();
  initializeDragAndDrop();
  initializeAddTask();
}

// Start the application
init();
