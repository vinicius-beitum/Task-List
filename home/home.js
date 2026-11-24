import { auth, onAuthStateChanged, signOut, updateProfile } from "../shared/firebase.js";
import { ensureUserDocument } from "../shared/user-service.js";
import { formatLongDate, getDueStatus } from "./date-utils.js";
import { createTaskRepository } from "./task-repository.js";
import {
    VIEWS,
    FOLDER_VIEW_PREFIX,
    countTasks,
    createViewContext,
    getFolderIdFromView,
    getVisibleTasks,
    resolveView
} from "./task-views.js";
import { renderAvatar, renderFolderList, renderTaskList } from "./render.js";
import { createTaskDialog, endOfTodayInputValue } from "./task-dialog.js";
import { createFolderDialog } from "./folder-dialog.js";
import { createProfileDialog } from "./profile-dialog.js";
import { showToast } from "./toast.js";

const LOGIN_URL = "../login/login.html";
const LAST_VIEW_KEY = "taskflow:last-view";
const REFRESH_INTERVAL = 60_000;

const elements = {
    profileButton: document.getElementById("open-profile"),
    sidebarAvatar: document.getElementById("sidebar-avatar"),
    profileName: document.getElementById("profile-name"),
    sidebar: document.querySelector(".sidebar"),
    folderList: document.getElementById("folder-list"),
    foldersEmpty: document.getElementById("folders-empty"),
    connectionStatus: document.getElementById("connection-status"),
    connectionLabel: document.getElementById("connection-label"),
    currentDate: document.getElementById("current-date"),
    greeting: document.getElementById("greeting"),
    summary: document.getElementById("summary"),
    viewTitle: document.getElementById("view-title"),
    viewDescription: document.getElementById("view-description"),
    taskCount: document.getElementById("task-count"),
    newTaskButton: document.getElementById("new-task"),
    taskList: document.getElementById("task-list"),
    emptyState: document.getElementById("empty-state"),
    deleteFolderDialog: document.getElementById("delete-folder-dialog"),
    deleteFolderDescription: document.getElementById("delete-folder-description")
};

const state = {
    user: null,
    tasks: [],
    folders: [],
    profile: { displayName: "", photo: "" },
    viewId: readLastView(),
    hasLoadedTasks: false,
    folderBeingDeleted: null
};

let repository = null;
let unsubscribers = [];

const taskDialog = createTaskDialog({ onSubmit: saveTask });
const folderDialog = createFolderDialog({ onSubmit: saveFolder });
const profileDialog = createProfileDialog({ onSubmit: saveProfile });

/* ---------- Utilidades ---------- */

function readLastView() {
    try {
        return localStorage.getItem(LAST_VIEW_KEY) ?? "today";
    } catch {
        return "today";
    }
}

function plural(count, singular, pluralForm) {
    return `${count} ${count === 1 ? singular : pluralForm}`;
}

function getGreeting(date) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
}

function persist(operation) {
    operation.catch((error) => {
        console.error("Erro ao salvar no Firestore:", error);
        const message = error?.code === "permission-denied"
            ? "Você não tem permissão para fazer essa alteração."
            : "Não foi possível salvar a alteração. Tente novamente.";
        showToast(message, { type: "error" });
    });
}

function handleReadError(error) {
    console.error("Erro ao ler do Firestore:", error);
    showToast("Não foi possível carregar seus dados. Recarregue a página.", { type: "error", duration: 8000 });
}

function findTask(taskId) {
    return state.tasks.find((task) => task.id === taskId);
}

function findFolder(folderId) {
    return state.folders.find((folder) => folder.id === folderId);
}

/* ---------- Renderização ---------- */

function buildSummary(dueToday, overdue, pending) {
    if (dueToday && overdue) {
        return `Você tem ${plural(dueToday, "tarefa", "tarefas")} para hoje e ${plural(overdue, "atrasada", "atrasadas")}.`;
    }
    if (dueToday) return `Você tem ${plural(dueToday, "tarefa", "tarefas")} para hoje.`;
    if (overdue) return `Você tem ${plural(overdue, "tarefa atrasada", "tarefas atrasadas")}.`;
    if (pending) return `Nada vence hoje. Você tem ${plural(pending, "tarefa pendente", "tarefas pendentes")}.`;
    return "Tudo em dia. Nenhuma tarefa pendente.";
}

function renderHeader(now, context) {
    const firstName = state.profile.displayName.trim().split(/\s+/)[0];
    const pending = state.tasks.filter((task) => !task.completed);
    const overdue = pending.filter((task) => getDueStatus(task.dueDate, now) === "overdue").length;
    const dueToday = countTasks(state.tasks, VIEWS.today, context) - overdue;

    elements.currentDate.textContent = formatLongDate(now);
    elements.greeting.textContent = firstName ? `${getGreeting(now)}, ${firstName}` : getGreeting(now);
    elements.summary.textContent = state.hasLoadedTasks ? buildSummary(dueToday, overdue, pending.length) : "";

    return overdue;
}

function render() {
    const now = new Date();
    const context = createViewContext(state.folders, now);
    let view = resolveView(state.viewId, state.folders);

    if (!VIEWS[state.viewId] && !view.folder) {
        state.viewId = "today";
        view = VIEWS.today;
    }

    const overdue = renderHeader(now, context);
    renderSidebar(context, overdue);

    elements.viewTitle.textContent = view.title;
    elements.viewDescription.textContent = view.description;
    elements.newTaskButton.hidden = state.viewId === "completed";
    document.title = `${view.title} · TaskFlow`;

    if (!state.hasLoadedTasks) return;

    const visibleTasks = getVisibleTasks(state.tasks, view, context);
    elements.taskCount.textContent = `· ${plural(visibleTasks.length, "tarefa", "tarefas")}`;

    renderTaskList(elements.taskList, elements.emptyState, {
        tasks: visibleTasks,
        view,
        now,
        foldersById: new Map(state.folders.map((folder) => [folder.id, folder])),
        showFolder: !view.folder
    });
}

function renderSidebar(context, overdue) {
    const pendingByFolder = new Map();
    state.tasks.forEach((task) => {
        if (!task.completed && task.folderId) {
            pendingByFolder.set(task.folderId, (pendingByFolder.get(task.folderId) ?? 0) + 1);
        }
    });

    renderAvatar(elements.sidebarAvatar, { name: state.profile.displayName, photo: state.profile.photo });
    elements.profileName.textContent = state.profile.displayName;

    document.querySelectorAll(".main-nav .nav-link").forEach((link) => {
        link.classList.toggle("is-active", link.dataset.view === state.viewId);
    });

    document.querySelectorAll("[data-count-for]").forEach((badge) => {
        const count = state.hasLoadedTasks ? countTasks(state.tasks, VIEWS[badge.dataset.countFor], context) : 0;
        badge.textContent = count || "";
    });
    document.querySelector('[data-count-for="today"]').classList.toggle("is-alert", overdue > 0);

    renderFolderList(elements.folderList, { folders: state.folders, activeViewId: state.viewId, pendingByFolder });
    elements.foldersEmpty.hidden = state.folders.length > 0;
}

function renderConnectionStatus() {
    const isOnline = navigator.onLine;
    elements.connectionStatus.dataset.status = isOnline ? "online" : "offline";
    elements.connectionLabel.textContent = isOnline ? "Sincronizado" : "Offline · alterações serão enviadas depois";
}

function setView(viewId) {
    state.viewId = viewId;
    try {
        localStorage.setItem(LAST_VIEW_KEY, viewId);
    } catch {
        // Sem localStorage a visão só não é lembrada no próximo acesso.
    }
    render();
    elements.taskList.focus({ preventScroll: true });
}

/* ---------- Ações ---------- */

function openNewTaskDialog() {
    const folderId = getFolderIdFromView(state.viewId);
    const isDateView = state.viewId === "today" || state.viewId === "upcoming";

    taskDialog.open({
        folders: state.folders,
        defaults: {
            folderId: folderId ?? "",
            dueDate: isDateView ? endOfTodayInputValue() : ""
        }
    });
}

function saveTask({ taskId, values }) {
    if (taskId) {
        persist(repository.updateTask(taskId, values));
        return;
    }

    persist(repository.createTask(values));

    const context = createViewContext(state.folders);
    const currentView = resolveView(state.viewId, state.folders);
    if (currentView.matches({ ...values, completed: false }, context)) return;

    const destinationId = values.folderId ? FOLDER_VIEW_PREFIX + values.folderId : "inbox";
    const destination = resolveView(destinationId, state.folders);
    showToast(`Tarefa criada em ${destination.title}.`, {
        action: { label: "Ver", onClick: () => setView(destinationId) }
    });
}

function toggleTask(task, completed) {
    persist(repository.setTaskCompleted(task.id, completed));

    if (completed) {
        showToast("Tarefa concluída.", {
            type: "success",
            action: { label: "Desfazer", onClick: () => persist(repository.setTaskCompleted(task.id, false)) }
        });
    }
}

function deleteTask(task) {
    persist(repository.deleteTask(task.id));
    showToast("Tarefa excluída.", {
        action: { label: "Desfazer", onClick: () => persist(repository.restoreTask(task)) }
    });
}

function saveFolder({ folderId, values }) {
    persist(folderId ? repository.updateFolder(folderId, values) : repository.createFolder(values));
}

function openDeleteFolderDialog(folder) {
    const taskCount = state.tasks.filter((task) => task.folderId === folder.id).length;
    const keepButton = elements.deleteFolderDialog.querySelector('[data-delete-folder="keep"]');
    const deleteButton = elements.deleteFolderDialog.querySelector('[data-delete-folder="all"]');

    state.folderBeingDeleted = folder;
    elements.deleteFolderDescription.textContent = taskCount
        ? `A pasta "${folder.name}" tem ${plural(taskCount, "tarefa", "tarefas")}. O que você quer fazer com elas? Essa ação não pode ser desfeita.`
        : `A pasta "${folder.name}" está vazia. Essa ação não pode ser desfeita.`;
    keepButton.hidden = taskCount === 0;
    deleteButton.textContent = taskCount ? "Excluir pasta e tarefas" : "Excluir pasta";

    elements.deleteFolderDialog.showModal();
}

function deleteFolder(keepTasks) {
    const folder = state.folderBeingDeleted;
    if (!folder) return;

    const taskIds = state.tasks.filter((task) => task.folderId === folder.id).map((task) => task.id);
    persist(repository.deleteFolder(folder.id, taskIds, { keepTasks }));

    state.folderBeingDeleted = null;
    elements.deleteFolderDialog.close();
    if (getFolderIdFromView(state.viewId) === folder.id) setView("inbox");

    showToast(keepTasks ? "Pasta excluída. As tarefas foram para a Caixa de Entrada." : "Pasta e tarefas excluídas.");
}

function saveProfile(profile) {
    state.profile = profile;
    persist(repository.saveProfile(profile));

    if (state.user.displayName !== profile.displayName) {
        updateProfile(state.user, { displayName: profile.displayName })
            .catch((error) => console.error("Não foi possível atualizar o nome na conta:", error));
    }
    render();
}

/* ---------- Sessão ---------- */

function stopListening() {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    unsubscribers = [];
}

function startSession(user) {
    state.user = user;
    state.profile = {
        displayName: user.displayName || user.email?.split("@")[0] || "Você",
        photo: ""
    };
    repository = createTaskRepository(user.uid);

    unsubscribers = [
        repository.watchTasks((tasks) => {
            state.tasks = tasks;
            state.hasLoadedTasks = true;
            render();
        }, handleReadError),
        repository.watchFolders((folders) => {
            state.folders = folders;
            render();
        }, handleReadError),
        repository.watchProfile((profile) => {
            if (profile?.displayName?.trim()) {
                state.profile = { displayName: profile.displayName, photo: profile.photo ?? "" };
            }
            render();
        }, handleReadError)
    ];

    ensureUserDocument(user).catch((error) => console.error("Não foi possível registrar o usuário:", error));
    render();
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        stopListening();
        window.location.replace(LOGIN_URL);
        return;
    }
    if (state.user?.uid !== user.uid) startSession(user);
});

/* ---------- Eventos ---------- */

elements.newTaskButton.addEventListener("click", openNewTaskDialog);
document.getElementById("new-folder").addEventListener("click", () => folderDialog.open({ folders: state.folders }));
elements.profileButton.addEventListener("click", () => profileDialog.open(state.profile));

document.getElementById("sign-out").addEventListener("click", () => {
    stopListening();
    signOut(auth).catch(() => showToast("Não foi possível sair. Tente novamente.", { type: "error" }));
});

elements.sidebar.addEventListener("click", (event) => {
    const folderAction = event.target.closest("[data-folder-action]");
    if (folderAction) {
        const folder = findFolder(folderAction.closest(".folder-item").dataset.folderId);
        folderAction.closest("details").open = false;
        if (!folder) return;

        if (folderAction.dataset.folderAction === "edit") folderDialog.open({ folder, folders: state.folders });
        else openDeleteFolderDialog(folder);
        return;
    }

    const viewLink = event.target.closest("[data-view]");
    if (viewLink) setView(viewLink.dataset.view);
});

elements.taskList.addEventListener("change", (event) => {
    if (!event.target.matches(".task-check")) return;
    const task = findTask(event.target.closest(".task").dataset.id);
    if (task) toggleTask(task, event.target.checked);
});

elements.taskList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const task = findTask(actionButton.closest(".task").dataset.id);
    if (!task) return;

    if (actionButton.dataset.action === "edit") taskDialog.open({ task, folders: state.folders });
    if (actionButton.dataset.action === "delete") deleteTask(task);
});

elements.taskList.addEventListener("dblclick", (event) => {
    const item = event.target.closest(".task");
    if (!item || event.target.closest("button, input")) return;
    const task = findTask(item.dataset.id);
    if (task) taskDialog.open({ task, folders: state.folders });
});

elements.deleteFolderDialog.querySelectorAll("[data-delete-folder]").forEach((button) => {
    button.addEventListener("click", () => deleteFolder(button.dataset.deleteFolder === "keep"));
});

document.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-close-dialog]");
    if (closeButton) closeButton.closest("dialog").close();

    if (event.target instanceof HTMLDialogElement) event.target.close();

    document.querySelectorAll(".folder-menu[open]").forEach((menu) => {
        if (!menu.contains(event.target)) menu.open = false;
    });
});

window.addEventListener("online", renderConnectionStatus);
window.addEventListener("offline", renderConnectionStatus);
window.setInterval(render, REFRESH_INTERVAL);

renderConnectionStatus();