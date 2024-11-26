// Arreglo para almacenar los procesos ingresados
let processes = []; 
// Arreglo para almacenar el plan de ejecución de los procesos
let schedule = []; 

// Función para agregar procesos cuando se envía el formulario
document.getElementById("processForm").addEventListener("submit", (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario

    // Obtener los valores ingresados en los campos del formulario
    const name = document.getElementById("processName").value;
    const arrivalTime = parseInt(document.getElementById("arrivalTime").value);
    const burstTime = parseInt(document.getElementById("burstTime").value);
    const priority = parseInt(document.getElementById("priority").value);

    // Agregar el nuevo proceso al arreglo de procesos
    processes.push({ name, arrivalTime, burstTime, priority });
    
    // Actualizar la tabla de procesos
    updateProcessTable();
    
    // Limpiar el formulario para el siguiente ingreso
    clearForm();
});

// Función para limpiar los campos del formulario
function clearForm() {
    document.getElementById("processName").value = "";
    document.getElementById("arrivalTime").value = "";
    document.getElementById("burstTime").value = "";
    document.getElementById("priority").value = "";
}

// Función para actualizar la tabla que muestra los procesos ingresados
function updateProcessTable() {
    const tableBody = document.querySelector("#processTable tbody");
    tableBody.innerHTML = ""; // Limpiar la tabla antes de actualizarla
    
    // Recorrer todos los procesos y agregarlos a la tabla
    processes.forEach((process) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${process.name}</td>
          <td>${process.arrivalTime}</td>
          <td>${process.burstTime}</td>
          <td>${process.priority}</td>
        `;
        tableBody.appendChild(row); // Añadir la fila a la tabla
    });
}

// Función para calcular la planificación por prioridad cuando se hace clic en "Calcular Prioridad"
document.getElementById("calculateBtn").addEventListener("click", () => {
    // Verificar si hay procesos para calcular
    if (processes.length === 0) {
        alert("No hay procesos para calcular.");
        return;
    }

    // Ordenar los procesos por prioridad (menor valor = mayor prioridad)
    processes.sort((a, b) => a.priority - b.priority);

    let currentTime = 0; // Tiempo actual del sistema
    let startTime = 0; // Tiempo de inicio del proceso
    let endTime = 0; // Tiempo de fin del proceso
    let waitingTime = 0; // Tiempo de espera
    let turnaroundTime = 0; // Tiempo en el sistema

    // Limpiar las tablas de resultados previos
    document.querySelector("#resultTable tbody").innerHTML = "";
    schedule = []; // Limpiar el plan de ejecución

    // Recorrer todos los procesos para calcular sus tiempos
    processes.forEach((process) => {
        // Si el tiempo actual es menor que el tiempo de llegada, actualizamos el tiempo
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }

        // Calcular el tiempo de espera (diferencia entre el tiempo actual y el de llegada)
        waitingTime = currentTime - process.arrivalTime;

        // Calcular los tiempos de inicio y fin del proceso
        startTime = currentTime;
        endTime = startTime + process.burstTime;
        turnaroundTime = endTime - process.arrivalTime; // Tiempo en el sistema

        // Agregar el proceso con los resultados a la tabla de resultados
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${process.name}</td>
          <td>${process.arrivalTime}</td>
          <td>${process.burstTime}</td>
          <td>${waitingTime}</td>
          <td>${startTime}</td>
          <td>${endTime}</td>
          <td>${turnaroundTime}</td>
        `;
        document.querySelector("#resultTable tbody").appendChild(row);

        // Registrar el proceso en el plan de ejecución para el diagrama de Gantt
        for (let t = startTime; t < endTime; t++) {
            schedule.push({ time: t, process: process.name });
        }

        // Actualizar el tiempo actual al tiempo de fin del proceso
        currentTime = endTime;
    });

    // Llamar a la función para renderizar el diagrama de Gantt
    renderGanttChart(schedule, processes);
});

// Función para renderizar el diagrama de Gantt
function renderGanttChart(schedule, processes) {
    const ganttBody = document.getElementById("ganttBody"); // Donde se dibujará el diagrama
    const timeHeaders = document.getElementById("timeHeaders"); // Encabezados de tiempo

    // Obtener los diferentes tiempos que se usan en el plan de ejecución
    const timeSlots = [...new Set(schedule.map(entry => entry.time))];

    // Establecer los encabezados de tiempo en el diagrama de Gantt
    timeHeaders.innerHTML = `<th>Proceso</th>` + timeSlots.map(time => `<th>${time}</th>`).join("");

    ganttBody.innerHTML = ""; // Limpiar el cuerpo del diagrama antes de renderizarlo

    // Recorrer cada proceso para dibujar su fila en el diagrama
    processes.forEach((process) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${process.name}</td>`; // Nombre del proceso

        let processStarted = false;
        let processFinished = false;

        // Mapear los tiempos para mostrar el estado de cada proceso en cada ranura de tiempo
        const states = timeSlots.map((time) => {
            // Si el tiempo es antes de la llegada del proceso, mostrar inactivo
            if (time < process.arrivalTime) {
                return `<td class="gantt-idle"></td>`;
            }

            // Si el proceso ya terminó, mostrar inactivo
            if (processFinished) {
                return `<td class="gantt-idle"></td>`;
            }
            
            // Si el proceso está ejecutándose, mostrar en ejecución
            const entry = schedule.find(entry => entry.time === time && entry.process === process.name);
            if (entry) {
                processStarted = true;
                return `<td class="gantt-running">E</td>`; // E = Ejecutando
            } else if (processStarted) {
                processFinished = true;
                return `<td class="gantt-idle"></td>`; // El proceso terminó, mostrar inactivo
            } else {
                return `<td class="gantt-waiting">P</td>`; // P = Esperando
            }
        });

        row.innerHTML += states.join(""); // Agregar los estados de cada ranura de tiempo a la fila
        ganttBody.appendChild(row); // Añadir la fila al diagrama de Gantt
    });
}
