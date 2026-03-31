let messages = [];

async function sendMessage() {
    const input = document.getElementById("input");
    const chat = document.getElementById("chat");

    const message = input.value;

    if (!message) return;

    input.value = "";
    input.disabled = true;

    // mensagem do usuário
    const userMsg = document.createElement("div");
    userMsg.className = "message user";

    userMsg.innerHTML = `
    <div class="bubble">${message}</div>
    <div class="avatar">👤</div>
  `;

    chat.appendChild(userMsg);

    messages.push({ role: "user", content: message });
    saveMessages();


    // loading
    chat.innerHTML += `
    <div id="loading" class="message bot">
      <div class="avatar">🤖</div>
      <div class="bubble">
        <span class="typing">
          <span></span><span></span><span></span>
        </span>
      </div>
    </div>
  `;

    chat.scrollTop = chat.scrollHeight;

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await res.json();

        document.getElementById("loading").remove();

        // resposta da IA
        const botMsg = document.createElement("div");
        botMsg.className = "message bot";

        const avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.textContent = "🤖";

        const bubble = document.createElement("div");
        bubble.className = "bubble";

        botMsg.appendChild(avatar);
        botMsg.appendChild(bubble);

        chat.appendChild(botMsg);

        setTimeout(() => {
            typeMessage(bubble, data.reply);
            messages.push({ role: "bot", content: data.reply });
            saveMessages();
        }, 300);

    } catch (error) {
        document.getElementById("loading").remove();

        chat.innerHTML += `
      <div class="message bot">
        <div class="avatar">🤖</div>
        <div class="bubble">Erro ao responder 😢</div>
      </div>
    `;
    }

    input.disabled = false;
    input.focus();
}

document.getElementById("input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function toggleTheme() {
    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");
    const btn = document.querySelector(".theme-btn");

    btn.textContent = isLight ? "☀️" : "🌙";

    localStorage.setItem("theme", isLight ? "light" : "dark");
}

function typeMessage(element, text) {
    let index = 0;

    function type() {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, 15);
        }
    }

    type();
}


function saveMessages() {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
}

window.onload = () => {
  const saved = localStorage.getItem("chatHistory");

  if (saved) {
    messages = JSON.parse(saved);
    renderMessages();
  }

  const theme = localStorage.getItem("theme");
  if (theme === "light") {
    document.body.classList.add("light");
    document.querySelector(".theme-btn").textContent = "☀️";
  }
};
    

function renderMessages() {
    const chat = document.getElementById("chat");
    chat.innerHTML = "";

    messages.forEach(msg => {
        const div = document.createElement("div");
        div.className = `message ${msg.role}`;

        const avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.textContent = msg.role === "user" ? "👤" : "🤖";

        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.textContent = msg.content;

        if (msg.role === "user") {
            div.appendChild(bubble);
            div.appendChild(avatar);
        } else {
            div.appendChild(avatar);
            div.appendChild(bubble);
        }

        chat.appendChild(div);
    });
}
