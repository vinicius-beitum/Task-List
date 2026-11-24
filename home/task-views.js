import { addDays, getDueStatus, parseDueDate, startOfDay } from "./date-utils.js";

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

function belongsToExistingFolder(task, context) {
    return Boolean(task.folderId) && context.folderIds.has(task.folderId);
}

function isDueTodayOrOverdue(task, context) {
    const status = getDueStatus(task.dueDate, context.now);
    return status === "today" || status === "overdue";
}

function isDueInNextSevenDays(task, context) {
    const dueDate = parseDueDate(task.dueDate);
    if (!dueDate) return false;

    const start = startOfDay(context.now);
    return dueDate >= start && dueDate < addDays(start, 7);
}

export const VIEWS = {
    today: {
        title: "Meu Dia",
        description: "Tarefas para hoje e atrasadas",
        emptyMessage: "Nada para hoje. Que tal planejar os próximos dias?",
        matches: (task, context) => !task.completed && isDueTodayOrOverdue(task, context)
    },
    inbox: {
        title: "Caixa de Entrada",
        description: "Tarefas que ainda não estão em uma pasta",
        emptyMessage: "Caixa de entrada vazia.",
        matches: (task, context) => !task.completed && !belongsToExistingFolder(task, context)
    },
    upcoming: {
        title: "Próximos 7 dias",
        description: "O que vence a partir de hoje até a próxima semana",
        emptyMessage: "Nenhuma tarefa com prazo nos próximos 7 dias.",
        matches: (task, context) => !task.completed && isDueInNextSevenDays(task, context)
    },
    completed: {
        title: "Concluídas",
        description: "Tarefas que você já finalizou",
        emptyMessage: "Você ainda não concluiu nenhuma tarefa.",
        matches: (task) => task.completed
    }
};

export const FOLDER_VIEW_PREFIX = "folder:";

export function getFolderIdFromView(viewId) {
    return viewId.startsWith(FOLDER_VIEW_PREFIX) ? viewId.slice(FOLDER_VIEW_PREFIX.length) : null;
}

export function resolveView(viewId, folders) {
    const folderId = getFolderIdFromView(viewId);

    if (!folderId) return VIEWS[viewId] ?? VIEWS.today;

    const folder = folders.find((item) => item.id === folderId);
    if (!folder) return VIEWS.today;

    return {
        title: folder.name,
        description: "Tarefas desta pasta",
        emptyMessage: "Esta pasta ainda não tem tarefas.",
        folder,
        matches: (task) => task.folderId === folder.id
    };
}

function compareDueDates(a, b) {
    const dateA = parseDueDate(a.dueDate);
    const dateB = parseDueDate(b.dueDate);

    if (dateA && dateB) return dateA - dateB;
    if (dateA) return -1;
    if (dateB) return 1;
    return 0;
}

export function compareTasks(a, b) {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.completed) return (b.concluidoEm ?? 0) - (a.concluidoEm ?? 0);

    return compareDueDates(a, b)
        || (PRIORITY_WEIGHT[a.priority] ?? 1) - (PRIORITY_WEIGHT[b.priority] ?? 1)
        || (a.criadoEm ?? 0) - (b.criadoEm ?? 0);
}

export function createViewContext(folders, now = new Date()) {
    return { now, folderIds: new Set(folders.map((folder) => folder.id)) };
}

export function getVisibleTasks(tasks, view, context) {
    return tasks.filter((task) => view.matches(task, context)).sort(compareTasks);
}

export function countTasks(tasks, view, context) {
    return tasks.reduce((total, task) => total + (view.matches(task, context) ? 1 : 0), 0);
}


export function getTaskStats(tasks, now = new Date()) {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const overdue = tasks.filter((task) => !task.completed && getDueStatus(task.dueDate, now) === "overdue").length;

    return {
        total,
        completed,
        pending: total - completed,
        overdue,
        completionRate: total ? Math.round((completed / total) * 100) : 0
    };
}