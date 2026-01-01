import express from "express";

const app = express();

// صفحة رئيسية للاختبار
app.get("/", (req, res) => {
  res.send("Backend يعمل ✅");
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
