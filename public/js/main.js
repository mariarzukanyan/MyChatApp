const socket = io();
const messagesContainer = document.querySelector(".chat-messages");
const chatForm = document.getElementById("chat-form");

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

console.log(token);

if(token){
  localStorage.setItem('token', token)
}else{
  window.location.href="/?message=Please login to enter the chat&status=fail"
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit("chatMsg", { msg, token });
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMsg(data) {
  const div = document.createElement("div");

  const container = document.querySelector(".chat-messages");
  div.classList.add("message");
  div.innerHTML = `<p class='meta'>${data.username}
<span>${data.time}</span></p><p class='text'>${data.message}</p>`;
  container.appendChild(div);
}
socket.on("message", (data) => {
  outputMsg(data);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

socket.emit('joinRoom', token)

const btn = document.getElementById('leave-btn')
btn.addEventListener('click', ()=>{
  const ifConfirmed = confirm('Are you sure you want to leave the chat?')
  if(ifConfirmed){
    window.location.href = "/"
  }
})

const roomCont = document.getElementById('room-name')
const usersCont = document.getElementById('users')

const outputRoom=(room)=>{
    roomCont.innerHTML=room
}
const outputUsersList=(list)=>{
  usersCont.innerHTML = `
    ${list.map((user) =>
    `<li>${user.username}</li>`).join("")}`; 
}

socket.on('usersInRoom', (data)=>{
  outputRoom(data.room)
  outputUsersList(data.usersList)
})

const emojiPicker = document.getElementById("emoji-picker");
const emojiButton = document.querySelector(".chat-smile");

emojiButton.addEventListener("click", () => {
  emojiPicker.style.display = emojiPicker.style.display === "none" ? "flex" : "none";
});

emojiPicker.addEventListener("click", (e) => {
  if (e.target.classList.contains("emoji")) {
    const emoji = e.target.dataset.emoji;
    const msgInput = document.getElementById("msg");
    msgInput.value += emoji;
    msgInput.focus();
  }
});

document.addEventListener("click", (e) => {
  if (!emojiButton.contains(e.target) && !emojiPicker.contains(e.target)) {
    emojiPicker.style.display = "none";
  }
});