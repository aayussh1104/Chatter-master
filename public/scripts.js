const socket = io();
let username = "";

while (!username.trim()) {
  username = prompt("Enter your name:");
}
username = username.trim().slice(0, 30);
socket.emit("join", username);

const messages = document.getElementById("messages");
const typingDisplay = document.getElementById("typing");
const inputField = document.getElementById("user-message");

document.getElementById("message-form").addEventListener("submit", e => {
  e.preventDefault();
  const msg = inputField.value.trim();
  if (msg) {
    socket.emit("mssgfromclient", msg);
    inputField.value = "";
  }
});

let typingTimeout;
inputField.addEventListener("input", () => {
  socket.emit("typing", username); // Tell others I'm typing
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("typing", ""); // Clear it after 1s
  }, 1000);
});

socket.on("mssgtoclients", ({ user, text }) => {
  const li = document.createElement("li");

  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const time = `${hours}:${minutes}`;

  li.textContent = `${user} [${time}]: ${text}`;
  li.classList.add(user === username ? "user" : "bot");

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight; // Always scroll to bottom
});

socket.on("typing", user => {
  typingDisplay.textContent = user ? `${user} is typing...` : "";
});

// Dark mode toggle
const toggleButton = document.getElementById('toggle-dark-mode');
toggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleButton.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});
