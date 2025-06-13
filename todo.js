document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle");
  const todoInput = document.getElementById("todo-input");
  const addTaskButton = document.getElementById("add-task-btn");
  const todoList = document.getElementById("todo-list");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // === THEME SETUP ===
  const savedTheme = localStorage.getItem("theme") || "dark";
  html.dataset.theme = savedTheme;
  themeToggleBtn.textContent = savedTheme === "dark" ? "🌙" : "☀️";

  
  themeToggleBtn.addEventListener("click", () => {
    const newTheme = html.dataset.theme === "dark" ? "light" : "dark";
    html.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
    themeToggleBtn.textContent = newTheme === "dark" ? "🌙" : "☀️";

    toggleSound.currentTime = 0;
    toggleSound.play();

    themeToggleBtn.classList.add("bounce");
    setTimeout(() => {
      themeToggleBtn.classList.remove("bounce");
    }, 300);
  });

  // === TASK LOGIC ===
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all";

  tasks.forEach(renderTask);

  addTaskButton.addEventListener("click", addTask);
  todoInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") addTask();
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTaskList();
    });
  });

  function addTask() {
    const taskText = todoInput.value.trim();
    if (taskText === "") return;

    const duplicate = tasks.some((t) => t.text.toLowerCase() === taskText.toLowerCase());
    if (duplicate) {
      alert("Duplicate task not allowed!");
      return;
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
    };

    tasks.push(newTask);
    saveTasks();
    todoInput.value = "";
    renderTaskList();
  }

  function renderTaskList() {
    todoList.innerHTML = "";

    const filteredTasks = tasks.filter((task) => {
      if (currentFilter === "completed") return task.completed;
      if (currentFilter === "pending") return !task.completed;
      return true;
    });

    filteredTasks.forEach(renderTask);
  }

  function renderTask(task) {
    const li = document.createElement("li");
    li.setAttribute("data-id", task.id);
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <span class="task-text">${task.text}</span>
      <input class="edit-input" type="text" value="${task.text}" />
      <button>Delete</button>
    `;

    const span = li.querySelector(".task-text");
    const input = li.querySelector(".edit-input");

    span.addEventListener("dblclick", () => {
      span.style.display = "none";
      input.style.display = "inline";
      input.focus();
    });

    input.addEventListener("blur", () => {
      const newText = input.value.trim();
      if (!newText || newText.toLowerCase() === task.text.toLowerCase()) {
        span.style.display = "inline";
        input.style.display = "none";
        return;
      }

      const duplicate = tasks.some(
        (t) => t.text.toLowerCase() === newText.toLowerCase() && t.id !== task.id
      );
      if (duplicate) {
        alert("Task already exists!");
        input.value = task.text;
      } else {
        task.text = newText;
        span.textContent = task.text;
        saveTasks();
      }

      span.style.display = "inline";
      input.style.display = "none";
    });

    li.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") return;
      task.completed = !task.completed;
      li.classList.toggle("completed");
      saveTasks();
      renderTaskList();
    });

    li.querySelector("button").addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTaskList();
    });

    todoList.appendChild(li);
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
});
