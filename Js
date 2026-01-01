import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Prop Backend is running");
});

/* ===== Crypto (Binance) ===== */
app.get("/price/crypto/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase() + "USDT";
    const r = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );
    const data = await r.json();
    res.json({ price: parseFloat(data.price) });
  } catch (e) {
    res.status(500).json({ error: "Crypto price error" });
  }
});

/* ===== Forex (TwelveData) ===== */
app.get("/price/forex/:pair", async (req, res) => {
  try {
    const pair = req.params.pair.toUpperCase();
    const r = await fetch(
      `https://api.twelvedata.com/price?symbol=${pair}&apikey=${process.env.FOREX_KEY}`
    );
    const data = await r.json();
    res.json({ price: parseFloat(data.price) });
  } catch (e) {
    res.status(500).json({ error: "Forex price error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
