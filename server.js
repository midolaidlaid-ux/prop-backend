import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔴 ضع توكن البوت هنا
const TOKEN = "PUT_YOUR_BOT_TOKEN_HERE";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// Webhook من Telegram
app.post("/webhook", async (req, res) => {
  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "مرحباً بك في منصة Prop Challenge 🚀\nاضغط للدخول إلى التداول:",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📈 دخول إلى منصة التداول",
              url: "https://midolaidlaid-ux.github.io/mini-prop-app/"
            }
          ]
        ]
      }
    })
  });

  res.sendStatus(200);
});

// صفحة اختبار
app.get("/", (req, res) => {
  res.send("Backend يعمل ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
