import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TOKEN = "8509851536:AAHTzXYmumV6DUmYffh_ptxam0LE5dhdcSE";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// ===== تخزين مؤقت =====
const users = {}; 
// users[chatId] = { balance, position }

app.get("/", (req, res) => {
  res.send("Trading backend running ✅");
});

// ===== سعر BTC الحقيقي =====
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
        balance: 5000,
        position: null
      };
    }

    if (text === "/trade") {
      await sendTradeMenu(chatId);
    }
  }

  // ===== أزرار =====
  if (u.callback_query) {
    const chatId = u.callback_query.message.chat.id;
    const action = u.callback_query.data;

    if (!users[chatId]) return res.sendStatus(200);

    const user = users[chatId];
    const price = await getBTC();

    // ===== BUY =====
    if (action === "buy" && !user.position) {
      user.position = {
        type: "BUY",
        entry: price
      };
      await send(chatId, `🟢 BUY @ ${price}`);
    }

    // ===== SELL =====
    if (action === "sell" && !user.position) {
      user.position = {
        type: "SELL",
        entry: price
      };
      await send(chatId, `🔴 SELL @ ${price}`);
    }

    // ===== CLOSE =====
    if (action === "close" && user.position) {
      let pnl =
        user.position.type === "BUY"
          ? price - user.position.entry
          : user.position.entry - price;

      user.balance += pnl;
      user.position = null;

      await send(
        chatId,
        `❌ Close @ ${price}\n💰 PnL: ${pnl.toFixed(2)}\n📊 Balance: ${user.balance.toFixed(
          2
        )}`
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
