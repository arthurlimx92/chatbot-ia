/* =============================================
   CHATBOT IA — SCRIPT PRINCIPAL
   ============================================= */

const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const clearBtn = document.getElementById('clearBtn');
const headerClearBtn = document.getElementById('headerClearBtn');
const deleteModal = document.getElementById('deleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const welcomeState = document.getElementById('welcomeState');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const sidebarToggle = document.getElementById('sidebarToggle');

// ─── Estado ───────────────────────────────────────────────
let conversationHistory = [];
let isLoading = false;
let recognition = null;
let isListening = false;

// ─── Inicialização ────────────────────────────────────────
loadHistory();
setupAutoResize();
setupSidebar();
setupVoice();
setupModal();
updateSendButton();

// ─── Histórico local ──────────────────────────────────────
function loadHistory() {
  try {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      conversationHistory = JSON.parse(saved);
      conversationHistory.forEach(msg => {
        renderMessage(msg.role, msg.content, false);
      });
      if (conversationHistory.length > 0) {
        welcomeState.style.display = 'none';
        scrollToBottom();
      }
    }
  } catch (e) {
    conversationHistory = [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem('chat_history', JSON.stringify(conversationHistory));
  } catch (e) {}
}

// ─── Auto-resize do textarea ──────────────────────────────
function setupAutoResize() {
  userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 180) + 'px';
    updateSendButton();
  });

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });
}

function updateSendButton() {
  sendBtn.disabled = userInput.value.trim() === '' || isLoading;
}

// ─── Sidebar (mobile) ─────────────────────────────────────
function setupSidebar() {
  // Criar backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  backdrop.id = 'sidebarBackdrop';
  document.body.appendChild(backdrop);

  menuBtn.addEventListener('click', openSidebar);
  sidebarToggle.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);
}

function openSidebar() {
  sidebar.classList.add('open');
  document.getElementById('sidebarBackdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Modal de confirmação ─────────────────────────────────
function setupModal() {
  clearBtn.addEventListener('click', () => openDeleteModal());
  headerClearBtn.addEventListener('click', () => openDeleteModal());

  cancelDelete.addEventListener('click', closeDeleteModal);
  confirmDelete.addEventListener('click', () => {
    clearHistory();
    closeDeleteModal();
  });

  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && deleteModal.classList.contains('open')) {
      closeDeleteModal();
    }
  });
}

function openDeleteModal() {
  if (conversationHistory.length === 0) {
    showToast('Nenhum histórico para apagar');
    return;
  }
  deleteModal.classList.add('open');
  closeSidebar();
}

function closeDeleteModal() {
  deleteModal.classList.remove('open');
}

function clearHistory() {
  conversationHistory = [];
  localStorage.removeItem('chat_history');

  // Remover todas as mensagens exceto o welcome state
  const messages = messagesContainer.querySelectorAll('.message, .typing-indicator');
  messages.forEach(m => m.remove());

  welcomeState.style.display = 'flex';
  showToast('Histórico apagado');
}

// ─── Reconhecimento de voz ────────────────────────────────
function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceBtn.title = 'Reconhecimento de voz não suportado neste navegador';
    voiceBtn.style.opacity = '0.4';
    voiceBtn.style.cursor = 'not-allowed';
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = true;
  recognition.continuous = false;

  let finalTranscript = '';

  recognition.addEventListener('start', () => {
    isListening = true;
    finalTranscript = '';
    voiceBtn.classList.add('listening');
    voiceBtn.querySelector('.icon-mic').style.display = 'none';
    voiceBtn.querySelector('.icon-mic-stop').style.display = '';
    showVoiceIndicator();
  });

  recognition.addEventListener('result', (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        finalTranscript += t + ' ';
      } else {
        interim += t;
      }
    }
    userInput.value = finalTranscript + interim;
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 180) + 'px';
    updateSendButton();
  });

  recognition.addEventListener('end', () => {
    isListening = false;
    voiceBtn.classList.remove('listening');
    voiceBtn.querySelector('.icon-mic').style.display = '';
    voiceBtn.querySelector('.icon-mic-stop').style.display = 'none';
    hideVoiceIndicator();

    if (finalTranscript.trim()) {
      userInput.value = finalTranscript.trim();
      updateSendButton();
    }
  });

  recognition.addEventListener('error', (e) => {
    isListening = false;
    voiceBtn.classList.remove('listening');
    voiceBtn.querySelector('.icon-mic').style.display = '';
    voiceBtn.querySelector('.icon-mic-stop').style.display = 'none';
    hideVoiceIndicator();

    const msgs = {
      'not-allowed': 'Permissão de microfone negada',
      'no-speech': 'Nenhuma fala detectada',
      'network': 'Erro de rede no reconhecimento de voz',
    };
    showToast(msgs[e.error] || 'Erro no reconhecimento de voz');
  });

  voiceBtn.addEventListener('click', toggleVoice);
}

function toggleVoice() {
  if (!recognition) return;
  if (isListening) {
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch (e) {
      showToast('Não foi possível iniciar o microfone');
    }
  }
}

// ─── Voice indicator UI ───────────────────────────────────
let voiceIndicator = null;

function showVoiceIndicator() {
  if (!voiceIndicator) {
    voiceIndicator = document.createElement('div');
    voiceIndicator.className = 'voice-indicator';
    voiceIndicator.innerHTML = `
      <div class="voice-wave">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <span>Ouvindo...</span>
    `;
    document.body.appendChild(voiceIndicator);
  }
  requestAnimationFrame(() => voiceIndicator.classList.add('visible'));
}

function hideVoiceIndicator() {
  if (voiceIndicator) {
    voiceIndicator.classList.remove('visible');
  }
}

// ─── Toast ────────────────────────────────────────────────
let toastEl = null;
let toastTimeout = null;

function showToast(message) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  clearTimeout(toastTimeout);
  requestAnimationFrame(() => toastEl.classList.add('visible'));
  toastTimeout = setTimeout(() => toastEl.classList.remove('visible'), 2800);
}

// ─── Sugestões ────────────────────────────────────────────
function useSuggestion(btn) {
  userInput.value = btn.textContent;
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 180) + 'px';
  updateSendButton();
  userInput.focus();
  sendMessage();
}

// ─── Enviar mensagem ──────────────────────────────────────
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  // Ocultar welcome
  welcomeState.style.display = 'none';

  // Limpar input
  userInput.value = '';
  userInput.style.height = 'auto';
  updateSendButton();

  // Parar voz se ativa
  if (isListening && recognition) recognition.stop();

  // Renderizar mensagem do usuário
  const userMsg = { role: 'user', content: text };
  conversationHistory.push(userMsg);
  saveHistory();
  renderMessage('user', text);
  scrollToBottom();

  // Indicador de digitação
  const typingEl = createTypingIndicator();
  messagesContainer.appendChild(typingEl);
  scrollToBottom();

  isLoading = true;
  updateSendButton();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Erro ${response.status}`);
    }

    const data = await response.json();
    const assistantText = data.content?.[0]?.text || data.message || '';

    typingEl.remove();

    const assistantMsg = { role: 'assistant', content: assistantText };
    conversationHistory.push(assistantMsg);
    saveHistory();
    renderMessage('assistant', assistantText);
    scrollToBottom();

  } catch (error) {
    typingEl.remove();
    renderMessage('assistant', `Ocorreu um erro: ${error.message}. Tente novamente.`);
    // Remover a mensagem do usuário do histórico se houve erro
    conversationHistory.pop();
    saveHistory();
    scrollToBottom();
  } finally {
    isLoading = false;
    updateSendButton();
    userInput.focus();
  }
}

// ─── Renderizar mensagem ──────────────────────────────────
function renderMessage(role, content, animate = true) {
  const msgEl = document.createElement('div');
  msgEl.className = `message ${role}`;
  if (!animate) msgEl.style.animation = 'none';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';

  if (role === 'assistant') {
    avatar.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  } else {
    avatar.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
    </svg>`;
  }

  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (role === 'assistant') {
    bubble.innerHTML = formatMarkdown(content);
  } else {
    bubble.textContent = content;
  }

  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = getCurrentTime();

  contentEl.appendChild(bubble);
  contentEl.appendChild(time);

  msgEl.appendChild(avatar);
  msgEl.appendChild(contentEl);

  messagesContainer.appendChild(msgEl);
}

function createTypingIndicator() {
  const el = document.createElement('div');
  el.className = 'typing-indicator';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const dots = document.createElement('div');
  dots.className = 'typing-dots';
  dots.innerHTML = '<span></span><span></span><span></span>';

  el.appendChild(avatar);
  el.appendChild(dots);
  return el;
}

// ─── Markdown simples ─────────────────────────────────────
function formatMarkdown(text) {
  // Escape HTML básico
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold e italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h4 style="font-size:0.95rem;font-weight:500;margin:12px 0 6px;color:var(--text-primary)">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 style="font-size:1rem;font-weight:500;margin:14px 0 8px;color:var(--text-primary)">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 style="font-size:1.1rem;font-weight:500;margin:16px 0 10px;color:var(--text-primary)">$1</h2>');

  // Listas não-ordenadas
  html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]+?<\/li>)/g, (match) => {
    if (!match.includes('<ul>')) return `<ul style="padding-left:18px;margin:8px 0">${match}</ul>`;
    return match;
  });

  // Listas ordenadas
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--text-accent);text-decoration:underline;text-decoration-color:rgba(167,139,250,0.4)">$1</a>');

  // Parágrafos
  html = html
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<') && !block.startsWith('<li')) return block;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  return html;
}

// ─── Utilitários ──────────────────────────────────────────
function getCurrentTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

// ─── Envio via botão ──────────────────────────────────────
sendBtn.addEventListener('click', sendMessage);