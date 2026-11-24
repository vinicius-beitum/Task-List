import { parseDueDate } from "./date-utils.js";

function toDateTimeInputValue(date) {
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function endOfTodayInputValue(now = new Date()) {
    const date = new Date(now);
    date.setHours(23, 59, 0, 0);
    return toDateTimeInputValue(date);
}

export function createTaskDialog({ onSubmit }) {
    const dialog = document.getElementById("task-dialog");
    const form = dialog.querySelector("form");
    const title = dialog.querySelector("#task-dialog-title");
    const errorElement = form.querySelector(".form-error");
    const { name, description, dueDate, priority, folderId } = form.elements;

    let editingTaskId = null;

    function showError(message, field) {
        errorElement.textContent = message;
        errorElement.hidden = false;
        field.focus();
    }

    function renderFolderOptions(folders, selectedId) {
        const options = [new Option("Sem pasta (Caixa de Entrada)", "")];
        folders.forEach((folder) => options.push(new Option(folder.name, folder.id)));
        folderId.replaceChildren(...options);
        folderId.value = folders.some((folder) => folder.id === selectedId) ? selectedId : "";
    }

    function open({ task = null, folders, defaults = {} }) {
        editingTaskId = task?.id ?? null;
        form.reset();
        errorElement.hidden = true;
        title.textContent = task ? "Editar tarefa" : "Nova tarefa";

        name.value = task?.name ?? "";
        description.value = task?.description ?? "";
        dueDate.value = task?.dueDate ?? defaults.dueDate ?? "";
        priority.value = task?.priority ?? "medium";
        renderFolderOptions(folders, task?.folderId ?? defaults.folderId ?? "");

        dialog.showModal();
        name.focus();
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const values = {
            name: name.value.trim(),
            description: description.value.trim(),
            dueDate: dueDate.value,
            priority: priority.value,
            folderId: folderId.value || null
        };

        if (!values.name) {
            showError("Dê um título para a tarefa.", name);
            return;
        }
        if (dueDate.validity.badInput || (values.dueDate && !parseDueDate(values.dueDate))) {
            showError("Informe uma data e um horário válidos.", dueDate);
            return;
        }

        onSubmit({ taskId: editingTaskId, values });
        dialog.close();
    });

    name.addEventListener("input", () => { errorElement.hidden = true; });

    return { open };
}