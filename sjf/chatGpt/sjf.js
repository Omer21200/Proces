// Escuchar cuando el documento esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    // Obtener referencias a los elementos del DOM
    const processForm = document.getElementById("processForm"); // Formulario de entrada de procesos
    const processTableBody = document.querySelector("#processTable tbody"); // Cuerpo de la tabla de procesos
    const resultTableBody = document.querySelector("#resultTable tbody"); // Cuerpo de la tabla de resultados

    let processes = []; // Arreglo para almacenar los procesos ingresados

    // Agregar proceso al hacer submit en el formulario
    processForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto (recargar la página)

        // Obtener los valores ingresados por el usuario
        const processName = document.getElementById("processName").value.trim(); // Nombre del proceso
        const arrivalTime = parseInt(document.getElementById("arrivalTime").value); // Tiempo de llegada
        const burstTime = parseInt(document.getElementById("burstTime").value); // Tiempo de ráfaga

        // Verificar si los datos son válidos antes de agregar el proceso
        if (processName && arrivalTime >= 0 && burstTime > 0) {
            // Agregar el proceso a la lista de procesos
            processes.push({ name: processName, arrivalTime, burstTime });
            renderProcessTable(); // Renderizar la tabla de procesos
            processForm.reset(); // Limpiar el formulario después de agregar el proceso
        }
    });

    // Función para renderizar la tabla de procesos
    function renderProcessTable() {
        processTableBody.innerHTML = ""; // Limpiar la tabla antes de renderizarla
        processes.forEach((process) => {
            // Crear una fila para cada proceso
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${process.name}</td>
                <td>${process.arrivalTime}</td>
                <td>${process.burstTime}</td>
            `;
            processTableBody.appendChild(row); // Añadir la fila al cuerpo de la tabla
        });
    }

    // Función para calcular la planificación Shortest Job First (SJF)
    function calculateSJF() {
        if (processes.length === 0) return; // Si no hay procesos, salir

        // Ordenar los procesos por tiempo de llegada (y por tiempo de ráfaga en caso de empate)
        processes.sort((a, b) => {
            if (a.arrivalTime === b.arrivalTime) {
                return a.burstTime - b.burstTime; // Si los tiempos de llegada son iguales, Aplica FIFO
            }
            return a.arrivalTime - b.arrivalTime; // Ordenar por tiempo de llegada
        });

        let timeElapsed = 0; // Control del tiempo transcurrido
        let results = []; // Almacenar los resultados de cada proceso
        let schedule = []; // Cronograma para el diagrama de Gantt
        const allProcesses = [...processes]; // Copia de los procesos originales para usarlos en el diagrama

        // Procesar los procesos
        while (processes.length > 0) {
            // Filtrar procesos que están disponibles para ejecución en el tiempo actual
            const availableProcesses = processes.filter(
                (p) => p.arrivalTime <= timeElapsed
            );

            if (availableProcesses.length > 0) {
                // Ordenar los procesos disponibles por tiempo de ráfaga
                availableProcesses.sort((a, b) => a.burstTime - b.burstTime);

                // Seleccionar el proceso con menor tiempo de ráfaga
                const process = availableProcesses[0];

                // Calcular el tiempo de inicio, fin, espera y turnaround del proceso
                const startTime = timeElapsed;
                const finishTime = startTime + process.burstTime - 1;
                const waitTime = startTime - process.arrivalTime;
                const timeInSystem = finishTime - process.arrivalTime + 1;

                // Agregar este proceso al cronograma
                for (let i = 0; i < process.burstTime; i++) {
                    schedule.push({ time: startTime + i, process: process.name });
                }

                // Actualizar el tiempo transcurrido
                timeElapsed = finishTime + 1;

                // Guardar los resultados del proceso
                results.push({
                    name: process.name,
                    arrivalTime: process.arrivalTime,
                    burstTime: process.burstTime,
                    waitTime,
                    startTime,
                    finishTime,
                    timeInSystem,
                });

                // Eliminar el proceso procesado de la lista
                processes = processes.filter((p) => p.name !== process.name);
            } else {
                // Si no hay procesos disponibles, simular inactividad y avanzar el tiempo
                schedule.push({ time: timeElapsed, process: "Idle" });
                timeElapsed++;
            }
        }

        // Calcular el tiempo promedio de espera
        const avgWaitTime =
            results.reduce((sum, process) => sum + process.waitTime, 0) / results.length;

        // Renderizar la tabla de resultados y el diagrama de Gantt
        renderResultTable(results, avgWaitTime);
        renderGanttChart(schedule, allProcesses);
    }

    // Función para renderizar la tabla de resultados
    function renderResultTable(results, avgWaitTime) {
        resultTableBody.innerHTML = ""; // Limpiar la tabla de resultados

        // Agregar los resultados de cada proceso a la tabla
        results.forEach((result) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${result.name}</td>
                <td>${result.arrivalTime}</td>
                <td>${result.burstTime}</td>
                <td>${result.startTime}</td>
                <td>${result.waitTime}</td>
                <td>${result.finishTime}</td>
                <td>${result.timeInSystem}</td>
            `;
            resultTableBody.appendChild(row); // Añadir la fila a la tabla de resultados
        });

        // Mostrar el tiempo promedio de espera
        const avgRow = document.createElement("tr");
        avgRow.innerHTML = `
            <td colspan="7">Tiempo promedio de espera: ${avgWaitTime.toFixed(2)}</td>
        `;
        resultTableBody.appendChild(avgRow); // Añadir la fila de promedio
    }

    // Función para renderizar el diagrama de Gantt
    function renderGanttChart(schedule, processes) {
        const ganttTable = document.getElementById("ganttTable"); // Tabla de Gantt
        const ganttBody = document.getElementById("ganttBody"); // Cuerpo de la tabla de Gantt
        const timeHeaders = document.getElementById("timeHeaders"); // Encabezados de tiempo

        // Obtener los intervalos de tiempo únicos del cronograma
        const timeSlots = [...new Set(schedule.map((entry) => entry.time))];

        // Establecer los encabezados de tiempo en la tabla de Gantt
        timeHeaders.innerHTML = `<th>Proceso</th>` + timeSlots.map((time) => `<th>${time}</th>`).join("");

        // Limpiar la tabla Gantt antes de agregar las filas
        ganttBody.innerHTML = "";

        // Crear una fila para cada proceso en el diagrama de Gantt
        processes.forEach((process) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${process.name}</td>`; // Nombre del proceso

            let processStarted = false;  // Verificar si el proceso ya comenzó
            let processFinished = false; // Verificar si el proceso ya terminó

            // Crear las celdas para cada ranura de tiempo
            const states = timeSlots.map((time) => {
                if (time < process.arrivalTime) {
                    // Si el tiempo es antes de la llegada del proceso, no se muestra nada
                    return `<td></td>`;
                }

                if (processFinished) {
                    // Si el proceso ha terminado, no se muestra nada
                    return `<td></td>`;
                }

                // Verificar si el proceso está ejecutándose en este tiempo
                const entry = schedule.find((entry) => entry.time === time && entry.process === process.name);

                if (entry) {
                    // Si el proceso está ejecutándose, marcar con "E"
                    processStarted = true;
                    return `<td class="e-exec">E</td>`;
                } else if (processStarted) {
                    // Si el proceso ya comenzó pero no tiene más entradas, marcar como finalizado
                    processFinished = true;
                    return `<td></td>`;  // Después de terminar, no mostrar nada
                } else {
                    // Si el proceso ha llegado pero no ha comenzado, marcar como esperando
                    return `<td class="p-wait">P</td>`; // "P" de espera
                }
            });

            row.innerHTML += states.join(""); // Unir las celdas y añadirlas a la fila
            ganttBody.appendChild(row); // Añadir la fila al cuerpo de la tabla Gantt
        });
    }

    // Botón para reiniciar todo
    resetBtn.addEventListener("click", () => {
        processes = []; // Limpiar la lista de procesos
        processTableBody.innerHTML = ""; // Limpiar la tabla de procesos
        resultTableBody.innerHTML = ""; // Limpiar la tabla de resultados
        ganttBody.innerHTML = ""; // Limpiar el cronograma de Gantt
        timeHeaders.innerHTML = ""; // Limpiar los encabezados de tiempo
        processForm.reset(); // Reiniciar el formulario
    });

    // Botón para calcular el algoritmo SJF
    document.getElementById("calculateBtn").addEventListener("click", calculateSJF);
});
