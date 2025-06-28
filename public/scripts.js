const socket = io();
const username = prompt("Enter your name:") || "Guest";
socket.emit("join", username);

const messages = document.getElementById("messages");
const typingDisplay = document.getElementById("typing");

document.getElementById("message-form").addEventListener("submit", e => {
  e.preventDefault();
  const msgInput = document.getElementById("user-message");
  const msg = msgInput.value.trim();
  if (msg) {
    socket.emit("mssgfromclient", msg);
    msgInput.value = "";
  }
});

document.getElementById("user-message").addEventListener("input", () => {
  socket.emit("typing");
});

// Live messages only
socket.on("mssgtoclients", ({ user, text }) => {
  const li = document.createElement("li");
  li.innerHTML = `<strong>${user}</strong>: ${text}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// Typing indicator
socket.on("typing", user => {
  typingDisplay.textContent = `${user} is typing...`;
  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(() => {
    typingDisplay.textContent = "";
  }, 1000);
});
