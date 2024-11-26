document.getElementById('processForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const input = document.getElementById('processInput').value;
    const processes = parseProcesses(input);
    const results = scheduleProcesses(processes);
    displayResults(results);
    drawGanttChart(results);
});

function parseProcesses(input) {
    return input.split(';').map(proc => {
        const [id, arrivalTime, burstTime, priority] = proc.split(',');
        return {
            id,
            arrivalTime: parseInt(arrivalTime),
            burstTime: parseInt(burstTime),
            priority: parseInt(priority),
            remainingTime: parseInt(burstTime)
        };
    });
}

function scheduleProcesses(processes) {
    // Ordenar procesos por tiempo de llegada y prioridad
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime || a.priority - b.priority);
    
    let time = 0;
    const results = [];
    const queue = [];
    
    while (processes.length || queue.length) {
        // Agregar procesos que han llegado
        while (processes.length && processes[0].arrivalTime <= time) {
            queue.push(processes.shift());
        }

        if (queue.length) {
            // Ordenar por prioridad
            queue.sort((a, b) => a.priority - b.priority);
            const current = queue.shift();
            const startTime = time;
            time += current.burstTime;
            const endTime = time;

            results.push({
                id: current.id,
                arrivalTime: current.arrivalTime,
                burstTime: current.burstTime,
                priority: current.priority,
                turnaroundTime: endTime - current.arrivalTime,
                waitingTime: startTime - current.arrivalTime
            });
        } else {
            time++;
        }
    }
    return results;
}

function displayResults(results) {
    const tbody = document.getElementById('resultTable').querySelector('tbody');
    tbody.innerHTML = '';
    results.forEach(result => {
        const row = `<tr>
            <td>${result.id}</td>
            <td>${result.arrivalTime}</td>
            <td>${result.burstTime}</td>
            <td>${result.priority}</td>
            <td>${result.turnaroundTime}</td>
            <td>${result.waitingTime}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function drawGanttChart(results) {
    const ganttChart = document.getElementById('ganttChart');
    ganttChart.innerHTML = '';
    let time = 0;

    results.forEach(result => {
        const executingCell = document.createElement('div');
        executingCell.className = 'gantt-cell executing';
        executingCell.innerText = result.id;
        ganttChart.appendChild(executingCell);

        for (let i = 0; i < result.burstTime - 1; i++) {
            const waitingCell = document.createElement('div');
            waitingCell.className = 'gantt-cell empty';
            ganttChart.appendChild(waitingCell);
        }
        time += result.burstTime;
    });

    // Agregar celdas en blanco para el tiempo no utilizado
    for (let i = time; i < 10; i++) { // Suponiendo un tiempo total de 10 para el diagrama
        const emptyCell = document.createElement('div');
        emptyCell.className = 'gantt-cell empty';
        ganttChart.appendChild(emptyCell);
    }
}

// Continuación del script.js

// Función para manejar la llegada de procesos en espera
function handleWaitingProcesses(queue, time) {
    queue.forEach(proc => {
        const waitingCell = document.createElement('div');
        waitingCell.className = 'gantt-cell waiting';
        waitingCell.innerText = 'P'; // Indica que está esperando
        ganttChart.appendChild(waitingCell);
    });
}

// Modificar la función drawGanttChart para incluir procesos en espera
function drawGanttChart(results) {
    const ganttChart = document.getElementById('ganttChart');
    ganttChart.innerHTML = '';
    let time = 0;
    const queue = [];

    results.forEach(result => {
        // Agregar celdas en espera si hay procesos en la cola
        handleWaitingProcesses(queue, time);

        const executingCell = document.createElement('div');
        executingCell.className = 'gantt-cell executing';
        executingCell.innerText = result.id;
        ganttChart.appendChild(executingCell);

        for (let i = 0; i < result.burstTime - 1; i++) {
            const waitingCell = document.createElement('div');
            waitingCell.className = 'gantt-cell empty';
            ganttChart.appendChild(waitingCell);
        }
        time += result.burstTime;
        queue.push(result); // Agregar el proceso actual a la cola
    });

    // Agregar celdas en blanco para el tiempo no utilizado
    for (let i = time; i < 10; i++) { // Suponiendo un tiempo total de 10 para el diagrama
        const emptyCell = document.createElement('div');
        emptyCell.className = 'gantt-cell empty';
        ganttChart.appendChild(emptyCell);
    }
}

