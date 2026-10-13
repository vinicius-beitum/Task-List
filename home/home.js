const taskForm = document.querySelector("#taskForm");
const taskList = document.querySelector("#taskList");
const taskDialog = document.querySelector("#taskDialog");
const taskTitle = document.querySelector("#taskTitle");
const taskDueDate = document.querySelector("#taskDueDate");
const taskFolder = document.querySelector("#taskFolder");
const taskFormError = document.querySelector("#taskFormError");
const appMessage = document.querySelector("#appMessage");
const accountEmail = localStorage.getItem("email") || "marcos";
const storageKey = `taskflow:${accountEmail}`;
const foldersStorageKey = `${storageKey}:folders`;
const profileStorageKey = `${storageKey}:profile`;
const notificationsStorageKey = `${storageKey}:notifications`;
const initialTasks = [];

let tasks = [];
let folders = [];
let notifications = [];
let profile = { displayName: "Marcos", photo: "" };
let currentView = "today";
let editingTaskId = null;
let editingFolderId = null;
let deletingFolderId = null;
let pendingProfilePhoto;
let profilePhotoChanged = false;
let messageTimer;

function readStoredValue(key, fallback, isValid) {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;

    let parsed;
    try {
        parsed = JSON.parse(value);
    } catch (error) {
        throw new Error(`Não foi possível ler os dados salvos (${key}). Os dados existentes foram preservados.`);
    }

    if (!isValid(parsed)) {
        throw new Error(`Os dados salvos (${key}) estão em um formato inválido e foram preservados.`);
    }
    return parsed;
}

function isTaskList(value) {
    return Array.isArray(value) && value.every((task) => task && typeof task === "object" && typeof task.id === "string" && typeof task.name === "string");
}

function isFolderList(value) {
    return Array.isArray(value) && value.every((folder) => folder && typeof folder.id === "string" && typeof folder.name === "string" && typeof folder.color === "string");
}

function isProfile(value) {
    return value && typeof value === "object" && typeof value.displayName === "string" && typeof value.photo === "string";
}

function isNotificationList(value) {
    return Array.isArray(value) && value.every((notification) => notification && typeof notification.id === "string"
        && typeof notification.taskId === "string" && typeof notification.dueDate === "string"
        && typeof notification.message === "string" && typeof notification.createdAt === "string");
}

function showMessage(message, type = "error") {
    window.clearTimeout(messageTimer);
    appMessage.textContent = message;
    appMessage.className = `app-message ${type}`;
    appMessage.hidden = false;
    messageTimer = window.setTimeout(() => { appMessage.hidden = true; }, 6000);
}

function showFormError(element, message) {
    element.textContent = message;
    element.hidden = !message;
}

function saveValue(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        const message = error.name === "QuotaExceededError"
            ? "O armazenamento do navegador está cheio. Libere espaço e tente novamente."
            : "Não foi possível salvar no navegador. Verifique as permissões de armazenamento.";
        showMessage(message);
        return false;
    }
}

function saveMultipleValues(changes) {
    const previousValues = changes.map(([key]) => [key, localStorage.getItem(key)]);
    try {
        changes.forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
        return true;
    } catch (error) {
        let rollbackFailed = false;
        previousValues.forEach(([key, value]) => {
            try {
                if (value === null) localStorage.removeItem(key);
                else localStorage.setItem(key, value);
            } catch (rollbackError) {
                rollbackFailed = true;
            }
        });
        showMessage(rollbackFailed
            ? "Não foi possível concluir a alteração nem restaurar todos os dados. Recarregue a página e confira suas tarefas."
            : "Não foi possível salvar a alteração. Os dados anteriores foram mantidos.");
        return false;
    }
}

function makeId() {
    return globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[character]));
}

function parseDueDate(value) {
    if (!value) return null;
    const localDateTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
    if (localDateTime) {
        const [, year, month, day, hour, minute, second = "0"] = localDateTime;
        const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
        if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)
            || date.getHours() !== Number(hour) || date.getMinutes() !== Number(minute)) return null;
        return date;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDueDate(value) {
    const date = parseDueDate(value);
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).format(date).replace(",", " às");
}

function localDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDueStatus(value) {
    const date = parseDueDate(value);
    if (!date) return "no-date";
    if (date.getTime() < Date.now()) return "overdue";
    if (localDateKey(date) === localDateKey(new Date())) return "today";
    return "future";
}

function getActiveFolder() {
    return currentView.startsWith("folder:") ? folders.find((folder) => folder.id === currentView.slice(7)) : null;
}

function getOverdueTasks() {
    return tasks.filter((task) => !task.completed && task.dueDate && parseDueDate(task.dueDate)?.getTime() < Date.now());
}

function syncOverdueNotifications() {
    const overdueTasks = getOverdueTasks();
    const currentByTask = new Map(overdueTasks.map((task) => [task.id, task]));
    const nextNotifications = overdueTasks.map((task) => {
        const existing = notifications.find((notification) => notification.taskId === task.id && notification.dueDate === task.dueDate);
        return existing || {
            id: makeId(),
            taskId: task.id,
            dueDate: task.dueDate,
            message: `Atenção: A tarefa '${task.name}' está vencida`,
            createdAt: new Date().toISOString()
        };
    }).map((notification) => {
        const task = currentByTask.get(notification.taskId);
        return { ...notification, message: `Atenção: A tarefa '${task.name}' está vencida` };
    });

    const serialized = JSON.stringify(nextNotifications);
    notifications = nextNotifications;
    try {
        if (localStorage.getItem(notificationsStorageKey) !== serialized) {
            saveValue(notificationsStorageKey, notifications);
        }
    } catch (error) {
        showMessage("Não foi possível ler os avisos salvos no navegador.");
    }
}

function matchesView(task) {
    if (currentView === "completed") return task.completed;
    if (currentView.startsWith("folder:")) return task.folderId === currentView.slice(7);
    if (task.completed) return false;
    if (currentView === "inbox") return false;
    if (currentView === "today") return !task.folderId;
    if (currentView === "week") {
        const date = parseDueDate(task.dueDate);
        if (!date) return false;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfNextWeek = new Date(startOfToday);
        startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
        return date >= startOfToday && date < startOfNextWeek;
    }
    return false;
}

function getViewDetails() {
    const folder = getActiveFolder();
    if (folder) return { title: folder.name, description: "Tarefas ativas nesta pasta" };
    return {
        today: { title: "Meu Dia", description: "Suas tarefas do dia a dia" },
        inbox: { title: "Caixa de Entrada", description: "Avisos de tarefas vencidas" },
        week: { title: "Próximos 7 Dias", description: "Tarefas com vencimento nos próximos sete dias" },
        completed: { title: "Concluídos", description: "Tarefas que você já concluiu" }
    }[currentView] || { title: "Meu Dia", description: "Tarefas com vencimento hoje" };
}

function renderInboxNotification(notification) {
    const task = tasks.find((item) => item.id === notification.taskId && !item.completed && item.dueDate === notification.dueDate);
    if (!task) return "";
    const dueLabel = formatDueDate(task.dueDate);
    return `<article class="task inbox-notification" data-id="${escapeHtml(task.id)}">
        <span class="notification-icon" aria-hidden="true">!</span>
        <div class="task-body"><h3 class="task-name">${escapeHtml(notification.message)}</h3>
        <div class="task-meta"><span class="task-due overdue">Venceu em ${escapeHtml(dueLabel)}</span></div></div>
        <div class="task-actions notification-actions"><button class="notice-edit" type="button" aria-label="Editar tarefa ${escapeHtml(task.name)}">✎</button><button class="notice-complete" type="button" aria-label="Concluir tarefa ${escapeHtml(task.name)}">✓</button></div>
    </article>`;
}

function renderTask(task) {
    const dueStatus = getDueStatus(task.dueDate);
    const dueLabel = formatDueDate(task.dueDate);
    const folder = folders.find((item) => item.id === task.folderId);
    const priorityLabels = { low: "Baixa", medium: "Média", high: "Alta" };
    const priority = priorityLabels[task.priority] ? task.priority : "medium";
    const dueMarkup = dueLabel
        ? `<span class="task-due ${dueStatus}">${dueStatus === "overdue" ? "Atrasada · " : dueStatus === "today" ? "Hoje · " : ""}${escapeHtml(dueLabel)}</span>`
        : '<span class="task-due no-date">Sem prazo</span>';
    const descriptionMarkup = task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : "";
    const folderMarkup = folder ? `<span class="task-folder"><span class="folder-dot" style="--folder-color:${escapeHtml(folder.color)}"></span>${escapeHtml(folder.name)}</span>` : "";

    return `<article class="task ${task.completed ? "completed" : ""} ${dueStatus}" data-id="${escapeHtml(task.id)}">
        <input class="task-check" type="checkbox" ${task.completed ? "checked" : ""} aria-label="${task.completed ? "Reabrir" : "Concluir"} ${escapeHtml(task.name)}">
        <div class="task-body"><div class="task-heading"><h3 class="task-name">${escapeHtml(task.name)}</h3><span class="priority-badge priority-${priority}">${priorityLabels[priority]}</span></div>
        ${descriptionMarkup}<div class="task-meta">${dueMarkup}${folderMarkup}</div></div>
        <div class="task-actions"><button class="edit" type="button" aria-label="Editar ${escapeHtml(task.name)}">✎</button><button class="remove" type="button" aria-label="Excluir ${escapeHtml(task.name)}">×</button></div>
    </article>`;
}

function renderTasks() {
    syncOverdueNotifications();
    const visibleTasks = tasks.filter(matchesView);
    const visibleNotifications = currentView === "inbox" ? notifications.map(renderInboxNotification).filter(Boolean) : null;
    const pending = tasks.filter((task) => !task.completed).length;
    const viewDetails = getViewDetails();
    document.querySelector("#pendingTasks").textContent = pending;
    document.querySelector("#navPending").textContent = notifications.length;
    const visibleCount = visibleNotifications ? visibleNotifications.length : visibleTasks.length;
    document.querySelector("#totalTasks").textContent = `${visibleCount} ${visibleCount === 1 ? (visibleNotifications ? "aviso" : "tarefa") : (visibleNotifications ? "avisos" : "tarefas")}`;
    document.querySelector("#sectionTitle").textContent = viewDetails.title;
    document.querySelector("#sectionDescription").textContent = viewDetails.description;
    taskList.innerHTML = visibleNotifications
        ? visibleNotifications.length ? visibleNotifications.join("") : '<p class="empty">Nenhum aviso de tarefa vencida.</p>'
        : visibleTasks.length ? visibleTasks.map(renderTask).join("") : '<p class="empty">Nenhuma tarefa nesta visualização.</p>';
    document.querySelector("#openNewTask").hidden = currentView === "inbox";
    document.querySelector("#sectionTitle").classList.toggle("inbox-title", currentView === "inbox");
    document.querySelectorAll(".nav-link").forEach((button) => button.classList.toggle("active", button.dataset.view === currentView));
    document.querySelectorAll(".folder-card").forEach((button) => button.classList.toggle("selected", button.dataset.view === currentView));
}

function renderProfile() {
    const initial = (profile.displayName.trim()[0] || "M").toLocaleUpperCase("pt-BR");
    document.querySelector("#profileName").textContent = profile.displayName;
    document.querySelector("#avatarInitial").textContent = initial;
    const avatarImage = document.querySelector("#avatarImage");
    avatarImage.hidden = !profile.photo;
    avatarImage.src = profile.photo || "";
    document.querySelector("#avatarInitial").hidden = Boolean(profile.photo);
}

function renderFolders() {
    const folderList = document.querySelector("#folderList");
    const folderSelect = document.querySelector("#taskFolder");
    const selectedId = folderSelect.value;
    folderSelect.replaceChildren(new Option("Sem pasta", ""));

    folders.forEach((folder) => {
        const option = new Option(folder.name, folder.id);
        folderSelect.add(option);
    });
    if (folders.some((folder) => folder.id === selectedId)) folderSelect.value = selectedId;

    folderList.innerHTML = folders.length ? folders.map((folder) => {
        const count = tasks.filter((task) => task.folderId === folder.id && !task.completed).length;
        return `<div class="folder-item">
            <button class="folder-card ${currentView === `folder:${folder.id}` ? "selected" : ""}" type="button" data-view="folder:${escapeHtml(folder.id)}">
                <span class="folder-icon" style="--folder-color:${escapeHtml(folder.color)}" aria-hidden="true">▰</span><span class="folder-card-name">${escapeHtml(folder.name)}</span><span class="folder-count" aria-label="${count} tarefas pendentes">${count}</span>
            </button>
            <details class="folder-menu"><summary aria-label="Opções da pasta ${escapeHtml(folder.name)}">•••</summary><div class="folder-menu-actions"><button type="button" data-folder-action="edit" data-folder-id="${escapeHtml(folder.id)}">Renomear / cor</button><button type="button" data-folder-action="delete" data-folder-id="${escapeHtml(folder.id)}">Excluir</button></div></details>
        </div>`;
    }).join("") : '<p class="empty-folder">Você ainda não criou pastas.</p>';
}

function renderDate() {
    document.querySelector("#currentDate").textContent = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric"
    }).format(new Date()).toLocaleUpperCase("pt-BR");
}

function openTaskDialog(task = null) {
    editingTaskId = task ? task.id : null;
    taskForm.reset();
    renderFolders();
    taskFormError.hidden = true;
    document.querySelector("#taskDialogTitle").textContent = task ? "Editar tarefa" : "Adicionar tarefa";
    document.querySelector("#saveTaskButton").textContent = task ? "Salvar alterações" : "Adicionar tarefa";
    if (task) {
        taskTitle.value = task.name;
        document.querySelector("#taskDescription").value = task.description || "";
        taskDueDate.value = task.dueDate || "";
        document.querySelector("#taskPriority").value = ["low", "medium", "high"].includes(task.priority) ? task.priority : "medium";
        taskFolder.value = task.folderId || "";
    } else {
        const activeFolder = getActiveFolder();
        taskFolder.value = activeFolder ? activeFolder.id : "";
    }
    taskDialog.showModal();
    taskTitle.focus();
}

function openFolderDialog(folder = null) {
    editingFolderId = folder ? folder.id : null;
    const folderForm = document.querySelector("#folderForm");
    folderForm.reset();
    document.querySelector("#folderDialogTitle").textContent = folder ? "Editar pasta" : "Nova pasta";
    document.querySelector("#saveFolderButton").textContent = folder ? "Salvar alterações" : "Criar pasta";
    document.querySelector("#folderName").value = folder ? folder.name : "";
    document.querySelector("#folderColor").value = folder ? folder.color : "#3b82f6";
    showFormError(document.querySelector("#folderFormError"), "");
    document.querySelector("#folderDialog").showModal();
    document.querySelector("#folderName").focus();
}

function setProfilePreview(photo) {
    const image = document.querySelector("#profilePreviewImage");
    image.hidden = !photo;
    image.src = photo || "";
    document.querySelector("#profilePreviewInitial").hidden = Boolean(photo);
}

function openProfileDialog() {
    document.querySelector("#displayName").value = profile.displayName;
    pendingProfilePhoto = profile.photo;
    profilePhotoChanged = false;
    document.querySelector("#profilePhoto").value = "";
    showFormError(document.querySelector("#profileFormError"), "");
    document.querySelector("#profilePreviewInitial").textContent = (profile.displayName.trim()[0] || "M").toLocaleUpperCase("pt-BR");
    setProfilePreview(pendingProfilePhoto);
    document.querySelector("#profileDialog").showModal();
    document.querySelector("#displayName").focus();
}

function imageFileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            reject(new Error("Escolha uma imagem JPG, PNG ou WebP."));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error("A imagem deve ter no máximo 5 MB."));
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const canvas = document.createElement("canvas");
            const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
            canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Não foi possível abrir esta imagem."));
        };
        image.src = objectUrl;
    });
}

function openDeleteFolderDialog(folderId) {
    deletingFolderId = folderId;
    const folder = folders.find((item) => item.id === folderId);
    if (!folder) return;
    document.querySelector("#deleteFolderTitle").textContent = `Excluir a pasta "${folder.name}"?`;
    document.querySelector("#deleteFolderDialog").showModal();
}

function deleteFolder(keepTasks) {
    const folder = folders.find((item) => item.id === deletingFolderId);
    if (!folder) return;
    const nextFolders = folders.filter((item) => item.id !== folder.id);
    const nextTasks = keepTasks
        ? tasks.map((task) => task.folderId === folder.id ? { ...task, folderId: null } : task)
        : tasks.filter((task) => task.folderId !== folder.id);

    if (!saveMultipleValues([[storageKey, nextTasks], [foldersStorageKey, nextFolders]])) return;
    tasks = nextTasks;
    folders = nextFolders;
    if (currentView === `folder:${folder.id}`) currentView = "inbox";
    deletingFolderId = null;
    document.querySelector("#deleteFolderDialog").close();
    renderFolders();
    renderTasks();
    showMessage(keepTasks ? "Pasta excluída. As tarefas foram mantidas sem pasta." : "Pasta e tarefas associadas excluídas.", "success");
}

function initialize() {
    tasks = readStoredValue(storageKey, initialTasks, isTaskList);
    folders = readStoredValue(foldersStorageKey, [], isFolderList);
    profile = readStoredValue(profileStorageKey, profile, isProfile);
    notifications = readStoredValue(notificationsStorageKey, [], isNotificationList);

    if (localStorage.getItem(storageKey) === null && !saveValue(storageKey, tasks)) {
        throw new Error("Não foi possível inicializar o armazenamento de tarefas.");
    }
    if (!profile.displayName.trim()) profile.displayName = "Marcos";
    renderProfile();
    renderFolders();
    renderDate();
    renderTasks();
}

try {
    initialize();
} catch (error) {
    taskList.innerHTML = "";
    showMessage(error.message);
    document.querySelector("#openNewTask").disabled = true;
    document.querySelector("#openNewFolder").disabled = true;
    document.querySelector("#openProfile").disabled = true;
}

document.querySelector("#openNewTask").addEventListener("click", () => openTaskDialog());
document.querySelector("#openNewFolder").addEventListener("click", () => openFolderDialog());
document.querySelector("#openProfile").addEventListener("click", openProfileDialog);

document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => document.querySelector(`#${button.dataset.close}`).close());
});

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = taskTitle.value.trim();
    const dueDate = taskDueDate.value;
    if (!name) {
        showFormError(taskFormError, "Informe o título da tarefa.");
        taskTitle.focus();
        return;
    }
    if (dueDate && (!taskDueDate.validity.valid || !parseDueDate(dueDate))) {
        showFormError(taskFormError, "Informe uma data e um horário válidos.");
        taskDueDate.focus();
        return;
    }

    const existingTask = tasks.find((task) => task.id === editingTaskId);
    const task = {
        ...(existingTask || {}),
        id: existingTask ? existingTask.id : makeId(),
        name,
        description: document.querySelector("#taskDescription").value.trim(),
        dueDate,
        folderId: taskFolder.value || null,
        priority: document.querySelector("#taskPriority").value,
        completed: existingTask ? Boolean(existingTask.completed) : false
    };
    const nextTasks = existingTask
        ? tasks.map((item) => item.id === existingTask.id ? task : item)
        : [...tasks, task];
    if (!saveValue(storageKey, nextTasks)) return;

    tasks = nextTasks;
    taskDialog.close();
    renderFolders();
    renderTasks();
    showMessage(existingTask ? "Tarefa atualizada." : "Tarefa adicionada.", "success");
});

taskList.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || !event.target.classList.contains("task-check")) return;
    const article = event.target.closest(".task");
    const task = tasks.find((item) => item.id === article.dataset.id);
    if (!task) return;
    const nextTasks = tasks.map((item) => item.id === task.id ? { ...item, completed: event.target.checked } : item);
    if (!saveValue(storageKey, nextTasks)) {
        event.target.checked = task.completed;
        return;
    }
    tasks = nextTasks;
    renderFolders();
    renderTasks();
});

taskList.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const article = event.target.closest(".task");
    if (!article) return;
    const task = tasks.find((item) => item.id === article.dataset.id);
    if (!task) return;
    if (event.target.closest(".notice-edit")) {
        openTaskDialog(task);
        return;
    }
    if (event.target.closest(".notice-complete")) {
        const nextTasks = tasks.map((item) => item.id === task.id ? { ...item, completed: true } : item);
        if (!saveValue(storageKey, nextTasks)) return;
        tasks = nextTasks;
        renderFolders();
        renderTasks();
        showMessage("Tarefa concluída.", "success");
        return;
    }
    if (event.target.closest(".edit")) {
        openTaskDialog(task);
        return;
    }
    if (event.target.closest(".remove") && window.confirm("Você realmente deseja excluir essa tarefa?")) {
        const nextTasks = tasks.filter((item) => item.id !== task.id);
        if (!saveValue(storageKey, nextTasks)) return;
        tasks = nextTasks;
        renderFolders();
        renderTasks();
        showMessage("Tarefa excluída.", "success");
    }
});

document.querySelectorAll(".nav-link").forEach((button) => {
    button.addEventListener("click", () => {
        currentView = button.dataset.view;
        renderTasks();
    });
});

document.querySelector("#folderList").addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const actionButton = event.target.closest("[data-folder-action]");
    if (actionButton) {
        actionButton.closest(".folder-menu").open = false;
        const folder = folders.find((item) => item.id === actionButton.dataset.folderId);
        if (!folder) return;
        if (actionButton.dataset.folderAction === "edit") openFolderDialog(folder);
        else openDeleteFolderDialog(folder.id);
        return;
    }
    const folderButton = event.target.closest(".folder-card");
    if (folderButton) {
        currentView = folderButton.dataset.view;
        renderTasks();
    }
});

document.querySelector("#folderForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#folderName").value.trim();
    const errorElement = document.querySelector("#folderFormError");
    if (!name) {
        showFormError(errorElement, "Informe o nome da pasta.");
        return;
    }
    if (folders.some((folder) => folder.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR") && folder.id !== editingFolderId)) {
        showFormError(errorElement, "Já existe uma pasta com esse nome.");
        return;
    }
    const current = folders.find((folder) => folder.id === editingFolderId);
    const folder = {
        id: current ? current.id : makeId(),
        name,
        color: document.querySelector("#folderColor").value
    };
    const nextFolders = current
        ? folders.map((item) => item.id === current.id ? folder : item)
        : [...folders, folder];
    if (!saveValue(foldersStorageKey, nextFolders)) return;
    folders = nextFolders;
    document.querySelector("#folderDialog").close();
    renderFolders();
    renderTasks();
    showMessage(current ? "Pasta atualizada." : "Pasta criada.", "success");
});

document.querySelector("#keepFolderTasks").addEventListener("click", () => deleteFolder(true));
document.querySelector("#deleteFolderTasks").addEventListener("click", () => deleteFolder(false));

document.querySelector("#profilePhoto").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const errorElement = document.querySelector("#profileFormError");
    showFormError(errorElement, "");
    try {
        pendingProfilePhoto = await imageFileToDataUrl(file);
        profilePhotoChanged = true;
        setProfilePreview(pendingProfilePhoto);
    } catch (error) {
        showFormError(errorElement, error.message);
        event.target.value = "";
    }
});

document.querySelector("#removeProfilePhoto").addEventListener("click", () => {
    pendingProfilePhoto = "";
    profilePhotoChanged = true;
    setProfilePreview("");
    document.querySelector("#profilePhoto").value = "";
});

document.querySelector("#displayName").addEventListener("input", (event) => {
    const initial = (event.target.value.trim()[0] || "M").toLocaleUpperCase("pt-BR");
    document.querySelector("#profilePreviewInitial").textContent = initial;
});

document.querySelector("#profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const displayName = document.querySelector("#displayName").value.trim();
    const errorElement = document.querySelector("#profileFormError");
    if (!displayName) {
        showFormError(errorElement, "Informe seu nome de exibição.");
        return;
    }
    const nextProfile = {
        displayName,
        photo: profilePhotoChanged ? pendingProfilePhoto : profile.photo
    };
    if (!saveValue(profileStorageKey, nextProfile)) return;
    profile = nextProfile;
    document.querySelector("#profileDialog").close();
    renderProfile();
    showMessage("Perfil atualizado.", "success");
});

renderDate();
window.setInterval(() => {
    renderDate();
    renderTasks();
}, 60_000);
