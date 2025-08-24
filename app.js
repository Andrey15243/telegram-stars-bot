import express from "express";
import bodyParser from "body-parser";
import { Telegraf, Markup } from "telegraf";
import cors from "cors";

const token = "7430493613:AAEfyR9XLw5CK2y82rVhFsZkVcAvKmXDtYc";
const DOMAIN = process.env.DOMAIN; // публичный URL Render
const PORT = process.env.PORT || 10000;

const bot = new Telegraf(token);
const app = express();

// ====== Мидлвары ======
app.use(cors());           // Разрешаем кросс-доменные запросы
app.use(bodyParser.json()); // Парсинг JSON

// ====== /start ======
bot.start((ctx) => {
  ctx.reply(
    "Привет! Покупаем звёзды ⭐",
    Markup.inlineKeyboard([
      Markup.button.webApp("Открыть Web App", "https://transaction-ton.web.app")
    ])
  );
});

// ====== WEBHOOK ======
const WEBHOOK_PATH = `/webhook/${token}`;
const WEBHOOK_URL = `${DOMAIN}${WEBHOOK_PATH}`;

app.post(WEBHOOK_PATH, (req, res) => {
  res.sendStatus(200);              // ответ сразу
  bot.handleUpdate(req.body).catch(console.error); // обработка асинхронно
});

// ====== CREATE INVOICE ======
app.post("/create-invoice", async (req, res) => {
  console.log("Запрос /create-invoice получен"); // лог
  try {
    const invoice = await bot.telegram.createInvoiceLink({
      title: "Покупка звезды",
      description: "Оплата через Telegram Stars",
      payload: "custom_payload",
      provider_token: "", 
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