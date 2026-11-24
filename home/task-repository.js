import { collection, db, deleteDoc, doc, onSnapshot, setDoc, updateDoc, writeBatch } from "../shared/firebase.js";

const DEFAULT_FOLDER_COLOR = "#3b82f6";
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function toMillis(value) {
    if (typeof value === "number") return value;
    if (typeof value?.toMillis === "function") return value.toMillis();
    return 0;
}

function toTask(snapshot) {
    const data = snapshot.data();

    return {
        id: snapshot.id,
        name: data.name ?? "",
        description: data.description ?? "",
        dueDate: data.dueDate ?? "",
        priority: ["low", "medium", "high"].includes(data.priority) ? data.priority : "medium",
        folderId: data.folderId ?? null,
        completed: Boolean(data.completed),
        criadoEm: toMillis(data.criadoEm),
        concluidoEm: toMillis(data.concluidoEm)
    };
}

function toFolder(snapshot) {
    const data = snapshot.data();

    return {
        id: snapshot.id,
        name: data.name ?? "Sem nome",
        color: HEX_COLOR.test(data.color) ? data.color : DEFAULT_FOLDER_COLOR,
        criadoEm: toMillis(data.criadoEm)
    };
}

function byCreation(a, b) {
    return a.criadoEm - b.criadoEm;
}

/**
 * Acesso ao Firestore de um usuário:

 *
 * As escritas não precisam ser aguardadas pela interface: o Firestore aplica a mudança

 */
export function createTaskRepository(uid) {
    const tasksRef = collection(db, "usuarios", uid, "tarefas");
    const foldersRef = collection(db, "usuarios", uid, "pastas");
    const profileRef = doc(db, "usuarios", uid, "dados", "perfil");

    return {
        watchTasks(onChange, onError) {
            return onSnapshot(tasksRef, (snapshot) => onChange(snapshot.docs.map(toTask)), onError);
        },

        watchFolders(onChange, onError) {
            return onSnapshot(foldersRef, (snapshot) => onChange(snapshot.docs.map(toFolder).sort(byCreation)), onError);
        },

        watchProfile(onChange, onError) {
            return onSnapshot(profileRef, (snapshot) => onChange(snapshot.exists() ? snapshot.data() : null), onError);
        },

        createTask(fields) {
            return setDoc(doc(tasksRef), { ...fields, completed: false, criadoEm: Date.now() });
        },

        updateTask(taskId, changes) {
            return updateDoc(doc(tasksRef, taskId), changes);
        },

        setTaskCompleted(taskId, completed) {
            return updateDoc(doc(tasksRef, taskId), { completed, concluidoEm: completed ? Date.now() : null });
        },

        deleteTask(taskId) {
            return deleteDoc(doc(tasksRef, taskId));
        },

        restoreTask({ id, ...fields }) {
            return setDoc(doc(tasksRef, id), fields);
        },

        createFolder(fields) {
            return setDoc(doc(foldersRef), { ...fields, criadoEm: Date.now() });
        },

        updateFolder(folderId, changes) {
            return updateDoc(doc(foldersRef, folderId), changes);
        },

        deleteFolder(folderId, taskIds, { keepTasks }) {
            const batch = writeBatch(db);

            taskIds.forEach((taskId) => {
                const taskRef = doc(tasksRef, taskId);
                if (keepTasks) batch.update(taskRef, { folderId: null });
                else batch.delete(taskRef);
            });
            batch.delete(doc(foldersRef, folderId));

            return batch.commit();
        },

        saveProfile(profile) {
            return setDoc(profileRef, profile, { merge: true });
        }
    };
}