# 🤖 Chatbot IA com OpenAI

Aplicação web de **chat inteligente com Inteligência Artificial**, capaz de responder perguntas e manter conversas dinâmicas em tempo real.

🔗 **Acesse o projeto:**
👉 https://chatbot-ia-7m5x.onrender.com/

---

## 🧠 Sobre o projeto

Este projeto consiste em um chatbot interativo que utiliza **IA generativa** para responder mensagens do usuário de forma natural e contextual.

A aplicação simula uma conversa em tempo real, semelhante a assistentes virtuais modernos, com foco em experiência do usuário e integração com APIs de IA.

---

## ⚙️ Tecnologias utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express

### Inteligência Artificial

* API da OpenAI

### Deploy

* Render

---

## ✨ Funcionalidades

* 💬 Chat em tempo real
* 🤖 Respostas geradas por IA
* ⚡ Integração com API externa
* 🎨 Interface simples e intuitiva
* 🔄 Comunicação assíncrona (fetch/async-await)

---

## 🔗 Como funciona

1. O usuário envia uma mensagem pelo frontend
2. A requisição é enviada para o backend
3. O backend consulta a API da OpenAI
4. A resposta da IA é retornada ao usuário

---

## 📁 Estrutura do projeto

```id="lcf1t4"
/backend
  ├── server.js
  ├── routes/
  ├── package.json

/frontend
  ├── index.html
  ├── script.js
  ├── style.css
```

---

## ▶️ Como rodar localmente

### 1. Clonar o repositório

```bash id="j0c28k"
git clone https://github.com/SEU-USUARIO/chatbot-ia.git
```

### 2. Instalar dependências

```bash id="lf7h3h"
cd backend
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env`:

```id="j6k0lm"
OPENAI_API_KEY=sua_chave_aqui
```

### 4. Rodar o servidor

```bash id="y6kh5b"
npm start
```

---

## ⚠️ Observações

* É necessário possuir uma chave válida da API da OpenAI
* O projeto pode apresentar latência dependendo da resposta da IA
* Ideal para fins de estudo e demonstração de integração com IA

---

## 🚀 Melhorias futuras

* Histórico de conversas
* Autenticação de usuários
* Interface estilo chat moderno (tipo WhatsApp/ChatGPT)
* Streaming de respostas

---

## 👨‍💻 Autor

Desenvolvido por **Arthur Lima**
🔗 https://github.com/arthurlimx92

---

## ⭐ Contribuição

Sinta-se à vontade para contribuir com melhorias ou sugestões!
