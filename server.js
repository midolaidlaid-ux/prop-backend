import express from "express";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;

// تأكيد أن التوكن موجود
if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN غير موجود");
}

// صفحة اختبار
app.get("/", (req, res) => {
  res.send("Backend يعمل ✅");
});

// استقبال رسائل Telegram
app.post("/telegram", async (req, res) => {
  console.log("📩 Update received:", JSON.stringify(req.body));

  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text;

  let reply = "أهلاً بك في منصة Prop Challenge 🚀";

  if (text === "/start") {
    reply =
      "👋 مرحبًا بك في Prop Challenge\n\n" +
      "اختر عرض التحدي:\n" +
      "1️⃣ 10$ → حساب 1000$\n" +
      "2️⃣ 20$ → حساب 3000$\n" +
      "3️⃣ 30$ → حساب 5000$";
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: reply
    })
  });

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
