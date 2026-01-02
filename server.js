import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TOKEN = "8509851536:AAHTzXYmumV6DUmYffh_ptxam0LE5dhdcSE";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// ===== إعدادات التحدي =====
const START_BALANCE = 5000;
const TARGET_BALANCE = 6000;
const MAX_LOSS_BALANCE = 4600;
const DAILY_LIMIT = 200;
const CHALLENGE_DAYS = 10;

// ===== تخزين مؤقت =====
const users = {};

app.get("/", (req, res) => {
  res.send("Prop Challenge backend running ✅");
});

// ===== سعر BTC =====
async function getBTC() {
  const r = await fetch(
    "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
  );
  const d = await r.json();
  return parseFloat(d.price);
}

// ===== Webhook =====
app.post("/webhook", async (req, res) => {
  const u = req.body;

  // ===== رسالة =====
  if (u.message) {
    const chatId = u.message.chat.id;
    const text = u.message.text;

    if (!users[chatId]) {
      users[chatId] = {
        balance: START_BALANCE,
        startDate: Date.now(),
        dayStartBalance: START_BALANCE,
        position: null,
        status: "active"
      };
    }

    if (text === "/trade") {
      await sendTradeMenu(chatId);
    }

    if (text === "/status") {
      const user = users[chatId];
      await send(
        chatId,
        `📊 Status: ${user.status}\n💰 Balance: ${user.balance.toFixed(2)}`
      );
    }
  }

  // ===== أزرار =====
  if (u.callback_query) {
    const chatId = u.callback_query.message.chat.id;
    const action = u.callback_query.data;
    const user = users[chatId];

    if (!user || user.status !== "active") return res.sendStatus(200);

    const price = await getBTC();

    // ===== BUY =====
    if (action === "buy" && !user.position) {
      user.position = { type: "BUY", entry: price };
      await send(chatId, `🟢 BUY @ ${price}`);
    }

    // ===== SELL =====
    if (action === "sell" && !user.position) {
      user.position = { type: "SELL", entry: price };
      await send(chatId, `🔴 SELL @ ${price}`);
    }

    // ===== CLOSE =====
    if (action === "close" && user.position) {
      const pnl =
        user.position.type === "BUY"
          ? price - user.position.entry
          : user.position.entry - price;

      user.balance += pnl;
      user.position = null;

      // ===== تحقق يوم جديد =====
      const now = new Date();
      const start = new Date(user.startDate);
      if (now.getDate() !== start.getDate()) {
        user.dayStartBalance = user.balance;
        user.startDate = Date.now();
      }

      // ===== القوانين =====
      const dailyPnL = user.balance - user.dayStartBalance;

      if (Math.abs(dailyPnL) > DAILY_LIMIT) {
        user.status = "failed";
        await send(chatId, "⛔ تجاوزت الحد اليومي 200$ – التحدي مرفوض");
        return res.sendStatus(200);
      }

      if (user.balance <= MAX_LOSS_BALANCE) {
        user.status = "failed";
        await send(chatId, "❌ وصلت إلى الخسارة القصوى – التحدي مرفوض");
        return res.sendStatus(200);
      }

      if (user.balance >= TARGET_BALANCE) {
        user.status = "passed";
        await send(chatId, "🎉 تهانينا! نجحت في التحدي");
        return res.sendStatus(200);
      }

      await send(
        chatId,
        `❌ Close @ ${price}\n💰 PnL: ${pnl.toFixed(
          2
        )}\n📊 Balance: ${user.balance.toFixed(2)}`
      );
    }
  }

  res.sendStatus(200);
});

// ===== واجهة التداول =====
async function sendTradeMenu(chatId) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "📈 Trading Panel (BTC)",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🟢 BUY", callback_data: "buy" },
            { text: "🔴 SELL", callback_data: "sell" }
          ],
          [{ text: "❌ CLOSE", callback_data: "close" }]
        ]
      }
    })
  });
}

async function send(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started"));
