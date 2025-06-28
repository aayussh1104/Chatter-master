const socket = io();
const username = prompt("Enter your name:");
let isReady = false;

// Emit join request
socket.emit("join", username);

// Wait for server to confirm join before allowing messages
socket.on("joined", () => {
  isReady = true;
});

const messages = document.getElementById("messages");
const typingDisplay = document.getElementById("typing");

// Submit message
document.getElementById("message-form").addEventListener("submit", e => {
  e.preventDefault();
  const msgInput = document.getElementById("user-message");
  const msg = msgInput.value.trim();
  if (msg && isReady) {
    socket.emit("mssgfromclient", msg);
    msgInput.value = "";
  }
});

// Typing status
document.getElementById("user-message").addEventListener("input", () => {
  if (isReady) {
    socket.emit("typing");
  }
});

// Receive message
socket.on("mssgtoclients", ({ user, text }) => {
  const li = document.createElement("li");
  li.innerHTML = `<strong>${user}</strong>: ${text}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// Receive typing
socket.on("typing", user => {
  typingDisplay.textContent = user ? `${user} is typing...` : "";
  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(() => {
    typingDisplay.textContent = "";
  }, 1000);
});
