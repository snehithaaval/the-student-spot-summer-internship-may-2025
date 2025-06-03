let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let username = localStorage.getItem("username");

document.addEventListener("DOMContentLoaded", () => {
  if (!username) {
    document.getElementById("greetModal").classList.remove("hidden");
  } else {
    document.getElementById("usernameDisplay").textContent = username;
    renderTasks();
  }

  // Alarm checker
  setInterval(checkAlarms, 1000);
});

function saveUsername() {
  const name = document.getElementById("usernameInput").value.trim();
  if (name) {
    localStorage.setItem("username", name);
    document.getElementById("usernameDisplay").textContent = name;
    document.getElementById("greetModal").classList.add("hidden");
    renderTasks();
  }
}

function openTaskModal() {
  document.getElementById("taskModal").classList.remove("hidden");
}

function closeTaskModal() {
  document.getElementById("taskModal").classList.add("hidden");
  clearModal();
}

function clearModal() {
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDesc").value = "";
  document.getElementById("taskDate").value = "";
  document.getElementById("taskTime").value = "";
  document.getElementById("isAlarm").checked = false;
}

function saveTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const date = document.getElementById("taskDate").value;
  const time = document.getElementById("taskTime").value;
  const isAlarm = document.getElementById("isAlarm").checked;

  if (!title || !date || !time) return alert("Please fill all fields.");

  tasks.push({ id: Date.now(), title, desc, date, time, isAlarm, completed: false });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  closeTaskModal();
}

function renderTasks(filter = "all") {
  const container = document.getElementById("taskList");
  container.innerHTML = "";

  const today = document.getElementById("filterDate").value;
  const filtered = tasks.filter(task => {
    if (filter === "alarm" && !task.isAlarm) return false;
    if (filter === "todo" && task.isAlarm) return false;
    if (today && task.date !== today) return false;
    return true;
  });

  for (const task of filtered) {
    const el = document.createElement("div");
    el.className = "task" + (task.isAlarm ? " alarm" : "") + (task.completed ? " completed" : "");
    el.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.desc}</p>
      <small>${task.date} @ ${task.time}</small>
      <div class="task-actions">
        <button onclick="toggleComplete(${task.id})">✅</button>
        <button onclick="deleteTask(${task.id})">🗑️</button>
      </div>
    `;
    container.appendChild(el);
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
  }
}

function checkAlarms() {
  const now = new Date();
  const current = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"


  for (const task of tasks) {
    if (task.isAlarm && !task.triggered) {
      const taskTime = `${task.date}T${task.time}`;
      if (taskTime === current) {
        const alarm = document.getElementById("alarmSound");
        document.getElementById("alarmTaskTitle").textContent = `🔔 ${task.title}`;
        alarm.play().catch(err => {
  console.error("Autoplay blocked:", err);
  alert(`🔔 Reminder: ${task.title}\n(Click anywhere to enable sound!)`);
});

        alarm.play();
        document.getElementById("alarmModal").classList.remove("hidden");
        task.triggered = true;
        localStorage.setItem("tasks", JSON.stringify(tasks));
      }
    }
  }
}


function filterTasks(type) {
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
  renderTasks(type);
}

function filterByDate() {
  renderTasks(document.querySelector(".nav-btn.active")?.textContent.toLowerCase() || "all");
}
function stopAlarm() {
  const alarm = document.getElementById("alarmSound");
  alarm.pause();
  alarm.currentTime = 0;
  document.getElementById("alarmModal").classList.add("hidden");
}

