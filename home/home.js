const formularioTarefa = document.querySelector("#formTarefa");
const nomeTarefa = document.querySelector("#nomeTarefa");
const dataTarefa = document.querySelector("#dataTarefa");
const horarioTarefa = document.querySelector("#horarioTarefa");
const listaTarefas = document.querySelector("#listaTarefas");
const totalTarefas = document.querySelector("#totalTarefas");
const armazenamento = "minhas-tarefas";

let tarefas = [];
tarefas = carregarTarefas();

function carregarTarefas() {
    try {
        return JSON.parse(localStorage.getItem(armazenamento)) || [];
    } catch (erro) {
        return [];
    }
}

function salvarTarefas() {
    localStorage.setItem(armazenamento, JSON.stringify(tarefas));
}

function escaparHtml(texto) {
    return String(texto).replace(/[&<>'"]/g, (caractere) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[caractere]));
}

function formatarDataHora(data, horario) {
    if (!data || !horario) return "Sem data e horário definidos";

    const [ano, mes, dia] = data.split("-");
    return `📅 ${dia}/${mes}/${ano} às ${horario}`;
}

// Renderiza a lista inteira sempre que os dados mudam.
function renderizarTarefas() {
    totalTarefas.textContent = tarefas.length;

    if (tarefas.length === 0) {
        listaTarefas.innerHTML = '<p class="empty-state">Nenhuma tarefa adicionada ainda.</p>';
        return;
    }

    listaTarefas.innerHTML = tarefas.map((tarefa) => `
        <article class="task-item ${tarefa.concluida ? "concluida" : ""}" data-id="${tarefa.id}">
            <input class="task-checkbox" type="checkbox" ${tarefa.concluida ? "checked" : ""} aria-label="Concluir ${escaparHtml(tarefa.nome)}">
            <div class="task-content">
                <p class="task-name">${escaparHtml(tarefa.nome)}</p>
                <p class="task-datetime">${formatarDataHora(tarefa.data, tarefa.horario)}</p>
            </div>
            <div class="task-actions">
                <button class="task-action editar" type="button" aria-label="Editar tarefa">✏️</button>
                <button class="task-action remover" type="button" aria-label="Excluir tarefa">🗑️</button>
            </div>
        </article>
    `).join("");
}

// Adiciona no final do array e, portanto, no final do contêiner.
function adicionarTarefa(evento) {
    evento.preventDefault();

    const nome = nomeTarefa.value.trim();
    if (!nome || !dataTarefa.value || !horarioTarefa.value) {
        formularioTarefa.reportValidity();
        return;
    }

    tarefas.push({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        nome,
        data: dataTarefa.value,
        horario: horarioTarefa.value,
        concluida: false
    });

    salvarTarefas();
    formularioTarefa.reset();
    renderizarTarefas();
    nomeTarefa.focus();
}

// Alterna o estado concluído da tarefa selecionada.
function alternarStatus(id, concluida) {
    const tarefa = tarefas.find((item) => item.id === id);
    if (!tarefa) return;

    tarefa.concluida = concluida;
    salvarTarefas();
    renderizarTarefas();
}

// Edita o nome, a data e o horário usando os campos de edição.
function editarTarefa(id) {
    const tarefa = tarefas.find((item) => item.id === id);
    if (!tarefa) return;

    const novoNome = window.prompt("Nome da tarefa:", tarefa.nome);
    if (novoNome === null || !novoNome.trim()) return;

    const novaData = window.prompt("Data de vencimento (AAAA-MM-DD):", tarefa.data);
    const novoHorario = window.prompt("Horário de vencimento (HH:MM):", tarefa.horario);
    if (!novaData || !novoHorario) return;

    tarefa.nome = novoNome.trim();
    tarefa.data = novaData;
    tarefa.horario = novoHorario;
    salvarTarefas();
    renderizarTarefas();
}

// Exclui a tarefa pelo ID e mantém as demais na mesma ordem.
function removerTarefa(id) {
    tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
    salvarTarefas();
    renderizarTarefas();
}

formularioTarefa.addEventListener("submit", adicionarTarefa);

listaTarefas.addEventListener("change", (evento) => {
    if (!evento.target.classList.contains("task-checkbox")) return;
    const id = evento.target.closest(".task-item").dataset.id;
    alternarStatus(id, evento.target.checked);
});

listaTarefas.addEventListener("click", (evento) => {
    const item = evento.target.closest(".task-item");
    if (!item) return;

    const id = item.dataset.id;
    if (evento.target.closest(".editar")) editarTarefa(id);
    if (evento.target.closest(".remover")) removerTarefa(id);
});

renderizarTarefas();
