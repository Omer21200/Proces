// sjf.js

function sjfScheduling(processes) {
    // Ordenar procesos por tiempo de ráfaga de CPU (SJF)
    processes.sort((a, b) => {
        if (a.burstTime === b.burstTime) {
            return a.arrivalTime - b.arrivalTime; // FIFO en caso de empate
        }
        return a.burstTime - b.burstTime;
    });

    let currentTime = 0;
    let totalWaitTime = 0;
    let totalTurnaroundTime = 0;

    // Calcular tiempos
    processes.forEach(process => {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime; // Esperar a que llegue el proceso
        }
        process.startTime = currentTime;
        process.finishTime = currentTime + process.burstTime;
        process.turnaroundTime = process.finishTime - process.arrivalTime;
        process.waitTime = process.startTime - process.arrivalTime;

        totalWaitTime += process.waitTime;
        totalTurnaroundTime += process.turnaroundTime;

        currentTime += process.burstTime; // Actualizar el tiempo actual
    });

    // Calcular promedios
    const averageWaitTime = totalWaitTime / processes.length;
    const averageTurnaroundTime = totalTurnaroundTime / processes.length;

    return { processes, averageWaitTime, averageTurnaroundTime };
}

function displayResults() {
    const processes = [
        { id: 1, arrivalTime: 0, burstTime: 8 },
        { id: 2, arrivalTime: 1, burstTime: 4 },
        { id: 3, arrivalTime: 2, burstTime: 9 },
        { id: 4, arrivalTime: 3, burstTime: 5 },
    ];

    const result = sjfScheduling(processes);

    let table = '<table border="1"><tr><th>ID</th><th>Tiempo de llegada</th><th>Tiempo de ráfaga</th><th>Tiempo de inicio</th><th>Tiempo de finalización</th><th>Tiempo de espera</th><th>Tiempo en el sistema</th></tr>';

    result.processes.forEach(process => {
        const turnaroundTime = process.turnaroundTime;
        table += `<tr>
            <td>${process.id}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td>${process.startTime}</td>
            <td>${process.finishTime}</td>
            <td>${process.waitTime}</td>
            <td>${turnaroundTime}</td>
        </tr>`;
    });

    table += '</table>';
    table += `<p>Tiempo promedio de espera: ${result.averageWaitTime.toFixed(2)}</p>`;
    table += `<p>Tiempo promedio en el sistema: ${result.averageTurnaroundTime.toFixed(2)}</p>`;

    document.getElementById('result').innerHTML = table;
}