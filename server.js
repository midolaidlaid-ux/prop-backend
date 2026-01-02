import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔴 توكن البوت (مؤقت)
const TOKEN = "8509851536:AAHTzXYmumV6DUmYffh_ptxam0LE5dhdcSE";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// ===== الصفحة الرئيسية =====
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ===== جلب سعر كريبتو (Binance) =====
// مثال: /price/BTCUSDT
app.get("/price/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );
    const data = await response.json();

    res.json({
      symbol: data.symbol,
      price: parseFloat(data.price)
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

// ===== Webhook تيليجرام =====
app.post("/webhook", async (req, res) => {
  const update = req.body;

  // ===== رسائل =====
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;

    // /start
    if (text === "/start") {
      await sendStartMenu(chatId);
    }

    // سعر بيتكوين
    if (text === "/btc") {
      const price = await getCryptoPrice("BTCUSDT");
      await sendMessage(chatId, `💰 سعر BTC الآن: ${price} $`);
    }
  }

  // ===== أزرار =====
  if (update.callback_query) {
    const chatId = update.callback_query.message.chat.id;
    const data = update.callback_query.data;

    let reply = "";

    if (data === "plan_1000") reply = "✅ اخترت اختبار حساب 1000$ مقابل 10$";
    if (data === "plan_3000") reply = "✅ اخترت اختبار حساب 3000$ مقابل 20$";
    if (data === "plan_5000") reply = "✅ اخترت اختبار حساب 5000$ مقابل 30$";

    await sendMessage(chatId, reply);
  }

  res.sendStatus(200);
});

// ===== دوال =====

async function getCryptoPrice(symbol) {
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
  );
  const data = await res.json();
  return parseFloat(data.price);
}

async function sendStartMenu(chatId) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "👋 مرحبًا بك في Prop Challenge\n\nاختر نوع التحدي:",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💰 10$ → حساب 1000$", callback_data: "plan_1000" }],
          [{ text: "💰 20$ → حساب 3000$", callback_data: "plan_3000" }],
          [{ text: "💰 30$ → حساب 5000$", callback_data: "plan_5000" }]
        ]
      }
    })
  });
}

async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });
}

// ===== تشغيل السيرفر =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
