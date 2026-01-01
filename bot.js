const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "اختر حساب التحدي:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💵 10$ → 1000$", callback_data: "plan_10" }],
        [{ text: "💵 20$ → 3000$", callback_data: "plan_20" }],
        [{ text: "💵 30$ → 5000$", callback_data: "plan_30" }]
      ]
    }
  });
});

bot.on("callback_query", (q) => {
  let link = "https://midolaidlaid-ux.github.io/mini-prop-app/dashboard.html";
  bot.sendMessage(q.message.chat.id,
    "✅ تم اختيار العرض\nاضغط للدخول للمنصة:",
    { reply_markup:{ inline_keyboard:[[ {text:"🚀 دخول المنصة", url:link} ]] } }
  );
});
