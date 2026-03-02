// State
let tasks = JSON.parse(localStorage.getItem('eduplan-tasks')) || [];
let calendarActivities = JSON.parse(localStorage.getItem('eduplan-calendar')) || [];
let currentTimerInterval;
let timerSeconds = 15 * 60; // 15 minutes default as requested
let isTimerRunning = false;
let currentTimerMode = 'work';
let viewDate = new Date(); // Date for calendar view
let selectedDate = null; // Date for modal

// Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const priorityInput = document.getElementById('priority-input');
const highTasksList = document.getElementById('high-tasks');
const mediumTasksList = document.getElementById('medium-tasks');
const lowTasksList = document.getElementById('low-tasks');
const completedCountEl = document.getElementById('completed-count');
const pendingCountEl = document.getElementById('pending-count');

const timeDisplay = document.getElementById('time-display');
const timerModeDisplay = document.getElementById('timer-mode');
const displayBox = document.querySelector('.timer-display');
const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');

const calendarGrid = document.getElementById('calendar-grid');
const currentMonthDisplay = document.getElementById('current-month-display');
const activityModal = document.getElementById('activity-modal');
const modalDateDisplay = document.getElementById('modal-date-display');
const activityForm = document.getElementById('activity-form');
const dayActivitiesList = document.getElementById('day-activities-list');

// --- TASK MANAGEMENT ---

function saveTasks() {
    localStorage.setItem('eduplan-tasks', JSON.stringify(tasks));
}

function updateStats() {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;
    completedCountEl.textContent = completed;
    pendingCountEl.textContent = pending;
}

function renderTasks() {
    highTasksList.innerHTML = '';
    mediumTasksList.innerHTML = '';
    lowTasksList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.priority} ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus(${task.id})">
                <span class="task-text">${task.text}</span>
            </div>
            <button class="delete-btn material-icons" onclick="deleteTask(${task.id})" title="Eliminar Tarea">delete</button>
        `;

        if (task.priority === 'high') highTasksList.appendChild(li);
        else if (task.priority === 'medium') mediumTasksList.appendChild(li);
        else lowTasksList.appendChild(li);
    });

    document.getElementById('high-priority-group').style.display = tasks.some(t => t.priority === 'high') ? 'block' : 'none';
    document.getElementById('medium-priority-group').style.display = tasks.some(t => t.priority === 'medium') ? 'block' : 'none';
    document.getElementById('low-priority-group').style.display = tasks.some(t => t.priority === 'low') ? 'block' : 'none';

    updateStats();
}

function addTask(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    const priority = priorityInput.value;
    if (!text) return;

    const newTask = { id: Date.now(), text, priority, completed: false };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = '';
}

window.toggleTaskStatus = function (id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    }
}

window.deleteTask = function (id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

taskForm.addEventListener('submit', addTask);

// --- TIMER MANAGEMENT ---

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function playAlarmSound() {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        oscillator.connect(context.destination);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 1500);
    } catch (e) {
        console.log("Audio not supported");
    }
}

function timerTick() {
    if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
    } else {
        clearInterval(currentTimerInterval);
        isTimerRunning = false;
        btnStart.disabled = false;
        btnPause.disabled = true;
        playAlarmSound();
        alert('¡Tiempo de actividad agotado!');
    }
}

function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    btnStart.disabled = true;
    btnPause.disabled = false;
    currentTimerInterval = setInterval(timerTick, 1000);
}

function pauseTimer() {
    if (!isTimerRunning) return;
    isTimerRunning = false;
    btnStart.disabled = false;
    btnPause.disabled = true;
    clearInterval(currentTimerInterval);
}

function resetTimer() {
    pauseTimer();
    const customMin = parseInt(document.getElementById('custom-minutes').value) || 15;
    timerSeconds = customMin * 60;
    updateTimerDisplay();
}

window.setTimer = function (minutes) {
    pauseTimer();
    timerSeconds = minutes * 60;
    document.getElementById('custom-minutes').value = minutes;
    updateTimerDisplay();
}

window.setCustomTimer = function () {
    const mins = parseInt(document.getElementById('custom-minutes').value);
    if (mins > 0) {
        setTimer(mins);
    }
}

btnStart.addEventListener('click', startTimer);
btnPause.addEventListener('click', pauseTimer);
btnReset.addEventListener('click', resetTimer);

// --- CALENDAR MANAGEMENT ---

function saveCalendar() {
    localStorage.setItem('eduplan-calendar', JSON.stringify(calendarActivities));
}

function renderCalendar() {
    calendarGrid.innerHTML = '';
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    currentMonthDisplay.textContent = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(viewDate);

    // Headers
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Padding for first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day other-month';
        calendarGrid.appendChild(empty);
    }

    const today = new Date();

    for (let d = 1; d <= daysInMonth; d++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }

        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        const dayActivities = calendarActivities.filter(a => a.date === dateStr);

        dayEl.innerHTML = `<span class="day-number">${d}</span>`;
        if (dayActivities.length > 0) {
            const indicators = document.createElement('div');
            indicators.className = 'activity-indicators';
            dayActivities.forEach(() => {
                const dot = document.createElement('div');
                dot.className = 'indicator';
                indicators.appendChild(dot);
            });
            dayEl.appendChild(indicators);
        }

        dayEl.onclick = () => openModal(dateStr);
        calendarGrid.appendChild(dayEl);
    }
}

window.changeMonth = function (dir) {
    viewDate.setMonth(viewDate.getMonth() + dir);
    renderCalendar();
}

function openModal(dateStr) {
    selectedDate = dateStr;
    const [y, m, d] = dateStr.split('-');
    const formattedDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, d));
    modalDateDisplay.textContent = `Actividades: ${formattedDate}`;
    renderDayActivities();
    activityModal.style.display = 'block';
}

window.closeModal = function () {
    activityModal.style.display = 'none';
}

function renderDayActivities() {
    dayActivitiesList.innerHTML = '';
    const activities = calendarActivities.filter(a => a.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    activities.forEach(act => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.innerHTML = `
            <div>
                <strong>${act.name}</strong>
                <span class="time">${act.time}</span>
            </div>
            <button class="delete-btn material-icons" onclick="deleteActivity(${act.id})">delete</button>
        `;
        dayActivitiesList.appendChild(li);
    });
}

activityForm.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('activity-name').value;
    const time = document.getElementById('activity-time').value;

    const newActivity = {
        id: Date.now(),
        date: selectedDate,
        name,
        time,
        alerted: false
    };

    calendarActivities.push(newActivity);
    saveCalendar();
    renderDayActivities();
    renderCalendar();
    activityForm.reset();
};

window.deleteActivity = function (id) {
    calendarActivities = calendarActivities.filter(a => a.id !== id);
    saveCalendar();
    renderDayActivities();
    renderCalendar();
}

// --- ALARMS ---

function checkAlarms() {
    const now = new Date();
    const currentDateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    calendarActivities.forEach(act => {
        if (act.date === currentDateStr && act.time === currentTimeStr && !act.alerted) {
            act.alerted = true;
            playAlarmSound();
            alert(`¡ALERTA! Actividad programada: ${act.name} a las ${act.time}`);
            saveCalendar();
        }
    });

    // Reset alerted state for future days if needed (though time is specific)
}

setInterval(checkAlarms, 30000); // Check every 30 seconds

// --- EXPORT ---

window.exportToPDF = function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("EduPlan - Organizador de Actividades", 20, 20);

    // Tasks Table
    const taskRows = tasks.map(t => [t.text, t.priority, t.completed ? 'Sí' : 'No']);
    doc.setFontSize(16);
    doc.text("Tareas y Prioridades", 20, 35);
    doc.autoTable({
        startY: 40,
        head: [['Tarea', 'Prioridad', 'Completada']],
        body: taskRows,
    });

    // Calendar Table
    const calRows = calendarActivities
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .map(a => [a.date, a.time, a.name]);

    doc.text("Calendario de Actividades", 20, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Fecha', 'Hora', 'Actividad']],
        body: calRows,
    });

    doc.save("EduPlan_Organizador.pdf");
}

window.exportToCSV = function () {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tipo,Descripcion/Nombre,Prioridad/Hora,Estado/Fecha\n";

    tasks.forEach(t => {
        csvContent += `Tarea,"${t.text}",${t.priority},${t.completed ? 'Completado' : 'Pendiente'}\n`;
    });

    calendarActivities.forEach(a => {
        csvContent += `Actividad,"${a.name}",${a.time},${a.date}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "EduPlan_Organizador.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- INITIALIZATION ---
renderTasks();
updateTimerDisplay();
renderCalendar();

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target == activityModal) {
        closeModal();
    }
}
