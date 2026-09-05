const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");

const addTask = document.getElementById("addTask");

const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const filter = document.getElementById("filter");


/* ADICIONAR TAREFA */

addTask.addEventListener("click", function () {

    const name = taskInput.value.trim();

    const date = taskDate.value;


    if (name === "") {

        alert("Digite uma tarefa!");

        return;
    }


    const empty = document.querySelector(".empty");

    if (empty) {
        empty.remove();
    }


    const task = document.createElement("div");

    task.classList.add("task");


    task.innerHTML = `

        <div class="task-left">

            <input type="checkbox">

            <div>

                <div class="task-name">
                    ${name}
                </div>

                <div class="task-date">
                    ${formatDate(date)}
                </div>

            </div>

        </div>


        <button class="delete">
            Excluir
        </button>

    `;


    /* CONCLUIR */

    const checkbox =
        task.querySelector("input");


    checkbox.addEventListener("change", function () {

        task.classList.toggle(
            "completed",
            checkbox.checked
        );

        updateStats();

    });


    /* EXCLUIR */

    const deleteButton =
        task.querySelector(".delete");


    deleteButton.addEventListener("click", function () {

        task.remove();

        updateStats();

        checkEmpty();

    });


    taskList.appendChild(task);


    taskInput.value = "";

    taskDate.value = "";


    updateStats();

});


/* FORMATAR DATA */

function formatDate(date) {

    if (!date) {

        return "Sem data";
    }


    const parts = date.split("-");


    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


/* ATUALIZAR ESTATÍSTICAS */

function updateStats() {

    const tasks =
        taskList.querySelectorAll(".task");


    let completed = 0;


    tasks.forEach(function (task) {

        const checkbox =
            task.querySelector("input");


        if (checkbox.checked) {

            completed++;

        }

    });


    const total = tasks.length;

    const pending = total - completed;


    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;
}


/* VERIFICAR LISTA VAZIA */

function checkEmpty() {

    const tasks =
        taskList.querySelectorAll(".task");


    if (tasks.length === 0) {

        taskList.innerHTML = `

            <div class="empty">
                Nenhuma tarefa por enquanto.
            </div>

        `;

    }

}


/* FILTRO */

filter.addEventListener("change", function () {

    const value = filter.value;

    const tasks =
        taskList.querySelectorAll(".task");


    tasks.forEach(function (task) {

        const checkbox =
            task.querySelector("input");


        if (value === "all") {

            task.style.display = "flex";

        }


        if (value === "completed") {

            task.style.display =
                checkbox.checked
                    ? "flex"
                    : "none";

        }


        if (value === "pending") {

            task.style.display =
                !checkbox.checked
                    ? "flex"
                    : "none";

        }

    });

});
