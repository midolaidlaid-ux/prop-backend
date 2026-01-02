import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔴 توكن البوت (مؤقت للاختبار)
const TOKEN = "8509851536:AAHTzXYmumV6DUmYffh_ptxam0LE5dhdcSE";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// Route اختبار
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// Webhook تيليجرام
app.post("/webhook", async (req, res) => {
  const update = req.body;

  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text || "رسالة بدون نص";

    try {
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `وصلت رسالتك: ${text}`
        })
      });
    } catch (err) {
      console.error("Telegram error:", err);
    }
  }

  res.sendStatus(200);
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
