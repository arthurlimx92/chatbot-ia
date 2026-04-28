import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Necessário para usar __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente
config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Serve os arquivos estáticos da pasta public/
app.use(express.static(path.join(__dirname, 'public')));

// ─── Endpoint principal ───────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Parâmetro "messages" inválido.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY não configurada.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente útil, preciso e direto. Responda sempre em português brasileiro, a menos que o usuário escreva em outro idioma.',
          },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error?.message || `Erro na API: ${response.status}`,
      });
    }

    const data = await response.json();

    // Normaliza a resposta para o mesmo formato que o frontend espera
    const normalized = {
      content: [{ text: data.choices?.[0]?.message?.content || '' }],
    };
    return res.json(normalized);

  } catch (err) {
    console.error('Erro ao chamar a API da OpenAI:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ─── Fallback SPA ─────────────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});