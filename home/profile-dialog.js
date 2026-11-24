import { renderAvatar } from "./render.js";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_DIMENSION = 512;

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Não foi possível abrir esta imagem."));
        };
        image.src = url;
    });
}

/** Reduz a foto para no máximo 512px e converte em JPEG (fica com poucos KB no Firestore). */
async function resizeToDataUrl(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) throw new Error("Escolha uma imagem JPG, PNG ou WebP.");
    if (file.size > MAX_FILE_SIZE) throw new Error("A imagem deve ter no máximo 5 MB.");

    const image = await loadImage(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");

    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.85);
}

export function createProfileDialog({ onSubmit }) {
    const dialog = document.getElementById("profile-dialog");
    const form = dialog.querySelector("form");
    const preview = dialog.querySelector("#profile-preview");
    const photoInput = dialog.querySelector("#profile-photo-input");
    const removeButton = dialog.querySelector("#remove-photo");
    const errorElement = form.querySelector(".form-error");
    const nameInput = form.elements.displayName;

    let draftPhoto = "";

    function updatePreview() {
        renderAvatar(preview, { name: nameInput.value, photo: draftPhoto });
        removeButton.hidden = !draftPhoto;
    }

    function showError(message) {
        errorElement.textContent = message;
        errorElement.hidden = false;
    }

    function open(profile) {
        form.reset();
        errorElement.hidden = true;
        nameInput.value = profile.displayName;
        draftPhoto = profile.photo;
        updatePreview();

        dialog.showModal();
        nameInput.focus();
    }

    photoInput.addEventListener("change", async () => {
        const [file] = photoInput.files;
        if (!file) return;

        errorElement.hidden = true;
        try {
            draftPhoto = await resizeToDataUrl(file);
            updatePreview();
        } catch (error) {
            showError(error.message);
        } finally {
            photoInput.value = "";
        }
    });

    removeButton.addEventListener("click", () => {
        draftPhoto = "";
        updatePreview();
    });

    nameInput.addEventListener("input", updatePreview);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const displayName = nameInput.value.trim();
        if (!displayName) {
            showError("Informe seu nome de exibição.");
            nameInput.focus();
            return;
        }

        onSubmit({ displayName, photo: draftPhoto });
        dialog.close();
    });

    return { open };
}