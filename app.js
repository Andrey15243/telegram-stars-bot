import express from "express";
import bodyParser from "body-parser";
import { Telegraf, Markup } from "telegraf";

const token = "7430493613:AAEfyR9XLw5CK2y82rVhFsZkVcAvKmXDtYc";
const DOMAIN = process.env.DOMAIN; // публичный URL Render
const PORT = process.env.PORT || 10000;

const bot = new Telegraf(token);

// /start — открывает Web App
bot.start((ctx) => {
  ctx.reply(
    "Привет! Покупаем звёзды ⭐",
    Markup.inlineKeyboard([
      Markup.button.webApp("Открыть Web App", "https://transaction-ton.web.app")
    ])
  );
});

const app = express();
app.use(bodyParser.json());

// ====== WEBHOOK ======
const WEBHOOK_PATH = `/webhook/${token}`;
const WEBHOOK_URL = `${DOMAIN}${WEBHOOK_PATH}`;

app.post(WEBHOOK_PATH, (req, res) => {
  res.sendStatus(200);              // отвечаем Telegram сразу
  bot.handleUpdate(req.body).catch(console.error); // обрабатываем апдейт асинхронно
});

// ====== CREATE INVOICE ======
app.post("/create-invoice", async (req, res) => {
  try {
    const invoice = await bot.telegram.createInvoiceLink({
      title: "Покупка звезды",
      description: "Оплата через Telegram Stars",
      payload: "custom_payload",
      provider_token: "", // пусто для Stars
      currency: "XTR",
      prices: [{ label: "Star", amount: 100 }]
    });
    res.json({ invoiceLink: invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ====== Запуск сервера ======
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await bot.telegram.setWebhook(WEBHOOK_URL);
  console.log(`Webhook установлен: ${WEBHOOK_URL}`);
});