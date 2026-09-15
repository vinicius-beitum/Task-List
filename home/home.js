const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskDate = document.querySelector("#taskDate");
const dateLabel = document.querySelector("#dateLabel");
const taskList = document.querySelector("#taskList");
const storageKey = `taskflow:${localStorage.getItem("email") || "marcos"}`;
let tasks = loadTasks();
let currentView = "today";

function loadTasks() { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { return []; } }
function saveTasks() { localStorage.setItem(storageKey, JSON.stringify(tasks)); }
function todayKey() { return new Date().toISOString().slice(0, 10); }
function isExpired(task) { return Boolean(task.dueDate && !task.completed && new Date(task.dueDate) < new Date()); }
function formatDate(value) { if (!value) return "Sem prazo"; return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
function matchesView(task) {
    if (currentView === "completed") return task.completed;
    if (currentView === "inbox") return isExpired(task);
    if (currentView === "week") { const limit = new Date(); limit.setDate(limit.getDate() + 7); return !task.completed && task.dueDate && new Date(task.dueDate) <= limit; }
    return !task.completed && (!task.dueDate || task.dueDate.slice(0, 10) === todayKey());
}
function renderTasks() {
    const visibleTasks = tasks.filter(matchesView);
    document.querySelector("#totalTasks").textContent = `${visibleTasks.length} tarefa${visibleTasks.length === 1 ? "" : "s"}`;
    taskList.innerHTML = visibleTasks.length ? visibleTasks.map(renderTask).join("") : '<p class="empty">Nenhuma tarefa nesta visualização.</p>';
    updateSummary();
}
function renderTask(task) {
    const readOnly = currentView === "inbox";
    const actions = readOnly ? "" : '<div class="task-actions"><button class="edit" type="button" aria-label="Editar tarefa">✎</button><button class="remove" type="button" aria-label="Excluir tarefa">⌫</button></div>';
    return `<article class="task ${task.completed ? "completed" : ""} ${readOnly ? "readonly" : ""}" data-id="${task.id}"><div class="task-left"><input class="task-check" type="checkbox" ${task.completed ? "checked" : ""} aria-label="Concluir ${escapeHtml(task.name)}"><div class="task-body"><div class="task-name">${escapeHtml(task.name)}</div><div class="task-date ${isExpired(task) ? "overdue" : ""}">${isExpired(task) ? "Expirada · " : "Vence: "}${formatDate(task.dueDate)}</div></div></div>${actions}</article>`;
}
function updateSummary() {
    const pending = tasks.filter((task) => !task.completed).length;
    const expired = tasks.filter(isExpired).length;
    document.querySelector("#pendingTasks").textContent = pending;
    document.querySelector("#navPending").textContent = pending;
    const alertBox = document.querySelector("#alertBox");
    alertBox.hidden = expired === 0;
    if (expired) document.querySelector("#alertMessage").textContent = `${expired} tarefa${expired === 1 ? "" : "s"} expirada${expired === 1 ? "" : "s"}.`;
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = taskInput.value.trim();
    if (!name) return taskInput.focus();
    tasks.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name, dueDate: taskDate.value, completed: false, createdAt: new Date().toISOString() });
    saveTasks(); taskForm.reset(); dateLabel.textContent = "Definir data e hora"; currentView = "inbox"; renderTasks();
});
taskDate.addEventListener("change", () => { dateLabel.textContent = taskDate.value ? formatDate(taskDate.value) : "Definir data e hora"; });
taskInput.addEventListener("keydown", (event) => { if (event.key === "Enter") taskForm.requestSubmit(); });

taskList.addEventListener("click", (event) => {
    const element = event.target.closest(".task");
    if (!element) return;
    const task = tasks.find((item) => item.id === element.dataset.id);
    if (!task) return;
    if (event.target.classList.contains("task-check")) { task.completed = event.target.checked; task.completedAt = task.completed ? new Date().toISOString() : null; if (task.completed) { element.classList.add("completing"); window.setTimeout(() => { saveTasks(); renderTasks(); }, 600); return; } }
    if (event.target.classList.contains("edit")) { const name = window.prompt("Editar tarefa:", task.name); if (name?.trim()) task.name = name.trim(); }
    if (event.target.classList.contains("remove")) tasks = tasks.filter((item) => item.id !== task.id);
    saveTasks(); renderTasks();
});

document.querySelectorAll(".nav-link").forEach((button) => button.addEventListener("click", () => { currentView = button.dataset.view; document.querySelectorAll(".nav-link").forEach((item) => item.classList.toggle("active", item === button)); document.querySelector("#sectionTitle").textContent = { today: "Hoje", inbox: "Caixa de Entrada · Expiradas", week: "Próximos 7 dias", completed: "Concluídos" }[currentView]; renderTasks(); }));
document.querySelector("#closeAlert")?.addEventListener("click", () => { document.querySelector("#alertBox").hidden = true; });
document.querySelector("#currentDate").textContent = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date()).toUpperCase();
renderTasks();
