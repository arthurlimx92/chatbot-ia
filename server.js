import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
  { role: "system", content: "Você é um atendente profissional de uma empresa de tecnologia." },
  { role: "user", content: message }
]
      })
    });

    const data = await response.json();
    console.log(data); // 👈 AQUI, logo depois do response.json()

    if (data.choices)
    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
 