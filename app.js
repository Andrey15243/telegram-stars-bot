import { Telegraf, Markup } from "telegraf";

// ====== Настройки ======
const token = "7430493613:AAEfyR9XLw5CK2y82rVhFsZkVcAvKmXDtYc";
const webAppUrl = "https://transaction-ton.web.app";
const DOMAIN = "https://YOUR_DOMAIN"; // например https://example.com
const PORT = process.env.PORT || 3000;
const MODE = process.env.MODE || "polling"; // по умолчанию polling

const bot = new Telegraf(token);

// ====== /start ======
bot.start((ctx) =>
  ctx.reply(
    "Привет! Это тестовый бот 🚀",
    Markup.inlineKeyboard([Markup.button.webApp("Открыть Web App", webAppUrl)])
  )
);

// ====== Запуск ======
if (MODE === "webhook") {
  // динамически подгружаем express только если нужен webhook
  const { default: express } = await import("express");
  const { default: bodyParser } = await import("body-parser");

  const app = express();
  app.use(bodyParser.json());

  const WEBHOOK_PATH = `/webhook/${token}`;
  const WEBHOOK_URL = `${DOMAIN}${WEBHOOK_PATH}`;

  app.post(WEBHOOK_PATH, (req, res) => {
    bot.handleUpdate(req.body, res).catch(console.error);
    res.sendStatus(200);
  });

  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await bot.telegram.setWebhook(WEBHOOK_URL);
    console.log(`Webhook установлен: ${WEBHOOK_URL}`);
  });
} else {
  // локальный режим (polling)
  bot.launch();
  console.log("Бот запущен через polling (локально)");
}