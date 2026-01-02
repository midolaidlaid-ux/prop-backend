import express from "express";

const app = express();
app.use(express.json());

// توكن البوت من Render Environment Variables
const BOT_TOKEN = process.env.BOT_TOKEN;

// صفحة اختبار
app.get("/", (req, res) => {
  res.send("Backend يعمل ✅");
});

// استقبال رسائل Telegram
app.post("/telegram", async (req, res) => {
  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text;

  // عند /start نرسل زر دخول المنصة
  if (text === "/start") {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "👋 مرحبًا بك في Prop Challenge\n\nاضغط الزر أدناه للدخول إلى المنصة 👇",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 دخول المنصة",
                url: "https://midolaidlaid-ux.github.io/mini-prop-app/dashboard.html"
              }
            ]
          ]
        }
      })
    });

    return res.sendStatus(200);
  }

  // رد افتراضي لأي رسالة أخرى
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "اكتب /start لبدء الدخول إلى المنصة 🚀"
    })
  });

  res.sendStatus(200);
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
