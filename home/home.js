const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskDate = document.querySelector("#taskDate");
const dateLabel = document.querySelector("#dateLabel");
const taskList = document.querySelector("#taskList");
const storageKey = `taskflow:${localStorage.getItem("email") || "marcos"}`;
const initialTasks = [
    { id: "task-1", name: "dsa", dueDate: "", completed: false },
    { id: "task-2", name: "dsa", dueDate: "", completed: false },
    { id: "task-3", name: "das", dueDate: "", completed: false },
    { id: "task-4", name: "asdasd", dueDate: "", completed: false }
];
let tasks = loadTasks();
let currentView = "today";

if (!localStorage.getItem(storageKey)) { tasks = initialTasks; saveTasks(); }
function loadTasks() { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; } }
function saveTasks() { localStorage.setItem(storageKey, JSON.stringify(tasks)); }
function escapeHtml(value) { return String(value).replace(/[&<>'\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
function formatDate(value) { if (!value) return "Vence: Sem prazo"; return `Vence: ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value))}`; }
function matchesView(task) { if (currentView === "completed") return task.completed; return !task.completed; }
function renderTask(task) { return `<article class="task ${task.completed ? "completed" : ""}" data-id="${task.id}"><div class="task-left"><input class="task-check" type="checkbox" ${task.completed ? "checked" : ""} aria-label="Concluir ${escapeHtml(task.name)}"><div class="task-body"><div class="task-name">${escapeHtml(task.name)}</div><div class="task-date">${formatDate(task.dueDate)}</div></div></div><div class="task-actions"><button class="edit" type="button" aria-label="Editar tarefa">✎</button><button class="remove" type="button" aria-label="Excluir tarefa">×</button></div></article>`; }
function renderTasks() { const visibleTasks = tasks.filter(matchesView); const pending = tasks.filter((task) => !task.completed).length; document.querySelector("#pendingTasks").textContent = pending; document.querySelector("#navPending").textContent = pending; document.querySelector("#totalTasks").textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? "tarefa" : "tarefas"}`; taskList.innerHTML = visibleTasks.length ? visibleTasks.map(renderTask).join("") : '<p class="empty">Nenhuma tarefa nesta visualização.</p>'; }

taskForm.addEventListener("submit", (event) => { event.preventDefault(); const name = taskInput.value.trim(); if (!name) return taskInput.focus(); tasks.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name, dueDate: taskDate.value, completed: false }); saveTasks(); taskForm.reset(); dateLabel.textContent = "Definir data e hora"; renderTasks(); taskInput.focus(); });
taskDate.addEventListener("change", () => { dateLabel.textContent = taskDate.value ? formatDate(taskDate.value) : "Definir data e hora"; });
taskList.addEventListener("click", (event) => { const element = event.target.closest(".task"); if (!element) return; const task = tasks.find((item) => item.id === element.dataset.id); if (!task) return; if (event.target.classList.contains("task-check")) task.completed = event.target.checked; if (event.target.classList.contains("edit")) { const name = window.prompt("Editar tarefa:", task.name); if (name?.trim()) task.name = name.trim(); } if (event.target.classList.contains("remove")) tasks = tasks.filter((item) => item.id !== task.id); saveTasks(); renderTasks(); });
document.querySelectorAll(".nav-link").forEach((button) => button.addEventListener("click", () => { currentView = button.dataset.view; document.querySelectorAll(".nav-link").forEach((item) => item.classList.toggle("active", item === button)); document.querySelector("#sectionTitle").textContent = { today: "Hoje", inbox: "Caixa de Entrada", week: "Próximos 7 dias", completed: "Concluídos" }[currentView]; renderTasks(); }));
document.querySelector("#currentDate").textContent = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date()).toUpperCase();
renderTasks();
