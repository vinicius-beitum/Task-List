import { formatDueDate, getDueStatus } from "./date-utils.js";
import { FOLDER_VIEW_PREFIX } from "./task-views.js";

const PRIORITY_LABELS = { low: "Baixa", medium: "Média", high: "Alta" };
const DUE_PREFIXES = { overdue: "Atrasada · ", today: "", upcoming: "", "no-date": "" };

const taskTemplate = document.getElementById("task-template");
const folderTemplate = document.getElementById("folder-template");

function createTaskElement(task, folder, now) {
    const element = taskTemplate.content.firstElementChild.cloneNode(true);
    const dueStatus = getDueStatus(task.dueDate, now);

    element.dataset.id = task.id;
    element.dataset.due = task.completed ? "done" : dueStatus;
    element.classList.toggle("is-completed", task.completed);

    const checkbox = element.querySelector(".task-check");
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `${task.completed ? "Reabrir" : "Concluir"} "${task.name}"`);

    element.querySelector(".task-name").textContent = task.name;

    const badge = element.querySelector(".priority-badge");
    badge.textContent = PRIORITY_LABELS[task.priority];
    badge.dataset.priority = task.priority;
    badge.hidden = task.priority === "medium";

    const description = element.querySelector(".task-description");
    description.textContent = task.description;
    description.hidden = !task.description;

    const due = element.querySelector(".task-due");
    due.dataset.status = dueStatus;
    due.querySelector("span").textContent = DUE_PREFIXES[dueStatus] + formatDueDate(task.dueDate, now);
    due.hidden = dueStatus === "no-date";

    const folderTag = element.querySelector(".task-folder");
    folderTag.hidden = !folder;
    if (folder) {
        folderTag.style.setProperty("--folder-color", folder.color);
        folderTag.querySelector("span:last-child").textContent = folder.name;
    }

    element.querySelector("[data-action=edit]").setAttribute("aria-label", `Editar "${task.name}"`);
    element.querySelector("[data-action=delete]").setAttribute("aria-label", `Excluir "${task.name}"`);

    return element;
}

export function renderTaskList(list, emptyState, { tasks, view, foldersById, now, showFolder }) {
    const elements = tasks.map((task) => createTaskElement(task, showFolder ? foldersById.get(task.folderId) : null, now));

    list.replaceChildren(...elements);
    list.setAttribute("aria-busy", "false");
    emptyState.textContent = view.emptyMessage;
    emptyState.hidden = tasks.length > 0;
}

export function renderFolderList(list, { folders, activeViewId, pendingByFolder }) {
    const items = folders.map((folder) => {
        const item = folderTemplate.content.firstElementChild.cloneNode(true);
        const link = item.querySelector(".folder-link");
        const viewId = FOLDER_VIEW_PREFIX + folder.id;
        const pending = pendingByFolder.get(folder.id) ?? 0;

        item.dataset.folderId = folder.id;
        link.dataset.view = viewId;
        link.classList.toggle("is-active", viewId === activeViewId);
        link.style.setProperty("--folder-color", folder.color);
        link.querySelector(".folder-name").textContent = folder.name;
        link.querySelector(".nav-count").textContent = pending || "";
        item.querySelector("summary").setAttribute("aria-label", `Opções da pasta ${folder.name}`);

        return item;
    });

    list.replaceChildren(...items);
}

export function renderAvatar(avatar, { name, photo }) {
    const initial = avatar.querySelector(".avatar-initial");
    const image = avatar.querySelector("img");

    initial.textContent = (name.trim()[0] ?? "?").toLocaleUpperCase("pt-BR");
    initial.hidden = Boolean(photo);
    image.hidden = !photo;

    if (photo) image.src = photo;
    else image.removeAttribute("src");
}


function describeProgress({ total, completed }) {
    if (total === 0) return "Crie sua primeira tarefa para acompanhar o progresso.";
    if (completed === 0) return "Nenhuma tarefa concluída ainda.";
    if (completed === total) return "Todas as tarefas concluídas.";
    return `${completed} de ${total} tarefas concluídas.`;
}

export function renderDashboard(dashboard, stats) {
    dashboard.total.textContent = stats.total;
    dashboard.completed.textContent = stats.completed;
    dashboard.pending.textContent = stats.pending;
    dashboard.overdue.textContent = stats.overdue;

    dashboard.progressDescription.textContent = describeProgress(stats);
    dashboard.progressPercentage.textContent = `${stats.completionRate}%`;
    dashboard.progressFill.style.width = `${stats.completionRate}%`;
    dashboard.progressBar.setAttribute("aria-valuenow", String(stats.completionRate));
}