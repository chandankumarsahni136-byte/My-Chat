const socket = io();

const joinBtn = document.getElementById('join');
const nameInput = document.getElementById('name');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const usersList = document.getElementById('users');

let joined = false;

function addMessage(item) {
  const li = document.createElement('li');
  const when = item.time ? new Date(item.time).toLocaleTimeString() : '';
  li.innerHTML = `<strong>${escapeHtml(item.from)}</strong> ${when ? '<span class="time">' + when + '</span>' : ''}<div class="text">${escapeHtml(item.text)}</div>`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

joinBtn.addEventListener('click', () => {
  const name = nameInput.value.trim() || 'Anonymous';
  socket.emit('join', name);
  joined = true;
  nameInput.disabled = true;
  joinBtn.disabled = true;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!joined) {
    alert('Please join first by entering your name.');
    return;
  }
  const val = input.value.trim();
  if (val.length === 0) return;
  socket.emit('message', val);
  input.value = '';
});

socket.on('message', (msg) => {
  // msg can be {from, text, time} or plain string
  if (typeof msg === 'string') {
    addMessage({ from: 'System', text: msg });
  } else {
    addMessage(msg);
  }
});

socket.on('users', (list) => {
  usersList.innerHTML = '';
  list.forEach((u) => {
    const li = document.createElement('li');
    li.textContent = u;
    usersList.appendChild(li);
  });
});
