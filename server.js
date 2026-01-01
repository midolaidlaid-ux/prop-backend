
const express = require("express");
const app = express();

// صفحة اختبار
app.get("/", (req, res) => {
  res.send("Backend يعمل ✅");
});

// تشغيل بوت تيليجرام
require("./bot");

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
