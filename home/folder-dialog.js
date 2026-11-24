export const FOLDER_COLORS = [
    { value: "#3b82f6", label: "Azul" },
    { value: "#22c55e", label: "Verde" },
    { value: "#eab308", label: "Amarelo" },
    { value: "#f97316", label: "Laranja" },
    { value: "#ef4444", label: "Vermelho" },
    { value: "#ec4899", label: "Rosa" },
    { value: "#8b5cf6", label: "Roxo" },
    { value: "#14b8a6", label: "Turquesa" },
    { value: "#64748b", label: "Cinza" }
];

export function createFolderDialog({ onSubmit }) {
    const dialog = document.getElementById("folder-dialog");
    const form = dialog.querySelector("form");
    const title = dialog.querySelector("#folder-dialog-title");
    const colorOptions = dialog.querySelector("#folder-colors");
    const errorElement = form.querySelector(".form-error");
    const nameInput = form.elements.name;

    let editingFolderId = null;
    let existingFolders = [];

    function renderColorOptions(selectedColor) {
        const colors = FOLDER_COLORS.some((color) => color.value === selectedColor)
            ? FOLDER_COLORS
            : [...FOLDER_COLORS, { value: selectedColor, label: "Cor atual" }];

        const options = colors.map(({ value, label }) => {
            const option = document.createElement("label");
            option.className = "color-option";
            option.style.setProperty("--swatch", value);
            option.title = label;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "color";
            input.value = value;
            input.checked = value === selectedColor;
            input.setAttribute("aria-label", label);

            option.append(input);
            return option;
        });

        colorOptions.replaceChildren(...options);
    }

    function showError(message) {
        errorElement.textContent = message;
        errorElement.hidden = false;
        nameInput.focus();
    }

    function open({ folder = null, folders }) {
        editingFolderId = folder?.id ?? null;
        existingFolders = folders;
        form.reset();
        errorElement.hidden = true;
        title.textContent = folder ? "Editar pasta" : "Nova pasta";
        nameInput.value = folder?.name ?? "";
        renderColorOptions(folder?.color ?? FOLDER_COLORS[0].value);

        dialog.showModal();
        nameInput.focus();
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const color = form.elements.color.value;
        const normalizedName = name.toLocaleLowerCase("pt-BR");
        const isDuplicate = existingFolders.some(
            (folder) => folder.id !== editingFolderId && folder.name.toLocaleLowerCase("pt-BR") === normalizedName
        );

        if (!name) {
            showError("Dê um nome para a pasta.");
            return;
        }
        if (isDuplicate) {
            showError("Você já tem uma pasta com esse nome.");
            return;
        }

        onSubmit({ folderId: editingFolderId, values: { name, color } });
        dialog.close();
    });

    nameInput.addEventListener("input", () => { errorElement.hidden = true; });

    return { open };
}